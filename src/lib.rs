//! The Developer Hub: what a workspace offers someone building on it.
//!
//! * Its own interface (`ui/`, at `/developers/`), embedded as [`UI`]: an overview of the REST API,
//!   the MCP endpoint, events and apps of one's own; the API reference read from the workspace's
//!   own OpenAPI document (`/api/openapi.json`), with a way to try what reads; the events each record
//!   gives, which webhooks and service apps name; and the person's API keys.
//! * No records of its own: everything it shows comes from the platform's APIs, as the person, so
//!   it shows them only what they may see.

use ferrum_domain::reports::ReportSource;
use ferrum_kernel::{HookRegistry, Kernel, Result};
use std::sync::Arc;

include!(concat!(env!("OUT_DIR"), "/ui.rs"));

/// This app's manifest (`app.yaml`).
pub const MANIFEST: &str = include_str!("../app.yaml");

/// This app's metadata packages: none.
pub fn packages() -> std::result::Result<Vec<ferrum_meta::Package>, ferrum_meta::MetaError> {
    Ok(Vec::new())
}

/// Document hooks: none.
pub fn register(_hooks: &mut HookRegistry) {}

/// Reports: none.
pub fn reports() -> Vec<Arc<dyn ReportSource>> {
    Vec::new()
}

/// Periodic upkeep: none.
pub async fn maintenance(_k: &Kernel) -> Result<()> {
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_interface_is_a_release_the_platform_takes() {
        let m = ferrum_apps::AppManifest::parse(MANIFEST).expect("app.yaml");
        assert_eq!((m.id.as_str(), m.packages.len()), ("developers", 0));
        assert_eq!(m.routes(), vec![("developers".to_string(), vec![])]);
        let files = UI.iter().map(|(p, b)| (p.to_string(), b.to_vec())).collect();
        let ui = ferrum_apps::ui::prepare("developers", files).expect("ui/dist is an interface release");
        assert!(UI.iter().any(|(p, _)| *p == "index.html") && !UI.iter().any(|(p, _)| p.starts_with('.')), "{}", ui.digest);
        assert!(packages().unwrap().is_empty());
    }
}
