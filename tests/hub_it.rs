//! What the Developer Hub tells people, held by the platform it runs on, against a real PostgreSQL
//! (`FERRUM_DEVELOPERS_TEST_DATABASE_URL`, reset first): a key made on the Keys page acts as its
//! person, with their rights and no more, until revoked; and a record gives the topics the Events
//! page names (`Entity.created`, `Entity.updated`, `Entity.deleted`).

use ferrum_kernel::tenant::NewTenant;
use ferrum_kernel::{Action, Db, DbConfig, Error, HookRegistry, Kernel, KernelSettings};
use ferrum_meta::Catalog;
use serde_json::json;
use std::sync::Arc;

#[test]
fn what_the_hub_says_holds() {
    let rt = tokio::runtime::Builder::new_multi_thread().enable_all().thread_stack_size(16 << 20).build().unwrap();
    rt.block_on(async { tokio::spawn(scenario()).await.unwrap() });
}

async fn scenario() {
    let url = std::env::var("FERRUM_DEVELOPERS_TEST_DATABASE_URL").unwrap_or_else(|_| "postgres://ferrum:ferrum@localhost:5432/ferrum_developers_test".into());
    let db = Db::connect(DbConfig { url, max_connections: 5, ..Default::default() }).await.expect("connect");
    sqlx::raw_sql("drop schema if exists public cascade; create schema public;").execute(&db.pool).await.expect("reset");
    let packages = ferrum_domain::packages().expect("the shared packages");
    let mut hooks = HookRegistry::default();
    ferrum_domain::register(&mut hooks);
    ferrum_app_developers::register(&mut hooks);
    let k: Arc<Kernel> = Kernel::boot(db, Catalog::from_packages(packages).unwrap(), hooks, KernelSettings::default(), None).await.expect("boot");
    let tenant = k
        .create_tenant(NewTenant {
            slug: "dev".into(),
            name: "Dev".into(),
            admin_email: "admin@dev.test".into(),
            admin_password: "Correct-Horse-9".into(),
            admin_name: None,
            packages: vec!["core".into(), "parties".into()],
            settings: None,
        })
        .await
        .unwrap();
    let session = k.login("dev", "admin@dev.test", "Correct-Horse-9").await.unwrap();
    let admin = k.load_ctx(tenant, session.user, None, "it".into()).await.unwrap();

    // ── a key acts as its person: an administrator's reads and writes customers ──
    let (key_id, key) = k.create_api_key(&admin, admin.user, "Nightly export", None, None).await.unwrap();
    let (s, scope) = k.verify_api_key(&key).await.unwrap();
    assert_eq!((s.user, scope), (admin.user, None), "a key to the whole API, as its maker");
    let by_key = k.load_ctx(tenant, s.user, Some(s.token_version), "key".into()).await.unwrap();
    let globex = k.insert(&by_key, "Customer", json!({"customer_name": "Globex"}).as_object().cloned().unwrap()).await.unwrap();

    // ── someone with no rights on customers gets a key with none either ──
    let clerk = k.create_user(&admin, "clerk@dev.test", "Clerk", Some("Correct-Horse-9"), &[], false).await.unwrap();
    let clerk = k.load_ctx(tenant, clerk, None, "it".into()).await.unwrap();
    assert_eq!(clerk.perms.access("Customer", Action::Read), ferrum_kernel::Access::None);
    let (_, theirs) = k.create_api_key(&clerk, clerk.user, "Mine", None, None).await.unwrap();
    let (s2, _) = k.verify_api_key(&theirs).await.unwrap();
    let by_their_key = k.load_ctx(tenant, s2.user, Some(s2.token_version), "key".into()).await.unwrap();
    let id = globex["id"].as_str().unwrap().parse().unwrap();
    assert!(matches!(k.get(&by_their_key, "Customer", id, false).await, Err(Error::Forbidden(_) | Error::NotFound(_))), "no more than their rights");
    assert!(k.create_api_key(&clerk, admin.user, "Not mine", None, None).await.is_err(), "keys are made for oneself");

    // ── revoked, it stops at once ──
    k.revoke_api_key(&admin, key_id).await.unwrap();
    assert!(k.verify_api_key(&key).await.is_err());

    // ── a record gives the topics the Events page names ──
    k.update(&admin, "Customer", id, json!({"customer_name": "Globex Ltd"}).as_object().cloned().unwrap(), None).await.unwrap();
    k.delete(&admin, "Customer", id, None).await.unwrap();
    let mut tx = k.db.system_tx().await.unwrap();
    let topics: Vec<String> =
        sqlx::query_scalar("select topic from outbox where tenant_id = $1 and entity = 'Customer' order by id").bind(tenant).fetch_all(&mut *tx).await.unwrap();
    tx.commit().await.unwrap();
    assert_eq!(topics, ["Customer.created", "Customer.updated", "Customer.deleted"]);
}
