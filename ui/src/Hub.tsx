// The Developer Hub's pages: what this workspace offers someone building on it, its API reference
// from the workspace's own OpenAPI document (with a way to try what reads), the person's API keys,
// and the events webhooks and service apps hear of.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { NavLink, useSearchParams } from "react-router";
import { api, bootstrap, errorMessage, formatDateTime, request, t } from "@ferrum/client";
import { Alert, Badge, Button, confirmDialog, EmptyState, ErrorState, PageLoading, toast } from "@ferrum/kit";
import { operations, requestPath, search, topics, type Operation } from "./openapi";

function Nav() {
  const link = (to: string, label: string) => (
    <NavLink to={to} end className={({ isActive }) => (isActive ? "hub-tab active" : "hub-tab")}>
      {label}
    </NavLink>
  );
  return (
    <nav className="hub-nav" aria-label={t("Developer Hub")}>
      {link("/", "Overview")}
      {link("/reference", "API reference")}
      {link("/events", "Events")}
      {link("/keys", "Your keys")}
    </nav>
  );
}

export function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="hub">
      <header className="hub-head">
        <h1>{title}</h1>
        <Nav />
      </header>
      {children}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card card-pad stack hub-card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: string }) {
  return <code className="mono hub-code">{children}</code>;
}

export function Overview() {
  const origin = typeof location === "undefined" ? "" : location.origin;
  const admin = bootstrap()?.person?.admin ?? false;
  return (
    <Page title={t("Developer Hub")}>
      <p className="muted">{t("Everything here is this workspace's: its API follows its records and your rights, and so does everything built on it.")}</p>
      <div className="hub-grid">
        <Card title={t("The REST API")}>
          <p>
            {t("Every record you may see, at")} <Code>{`${origin}/api/v1/{Entity}`}</Code>{t(", with a key or your session. The")} <NavLink to="/reference">reference</NavLink> {t("lists this workspace's operations; its OpenAPI document is")} <a href="/api/openapi.json">/api/openapi.json</a>.
          </p>
          <pre className="hub-pre">{`curl -H "Authorization: Bearer fk_…" ${origin}/api/v1/Customer?limit=5`}</pre>
        </Card>
        <Card title={t("For AI agents")}>
          <p>
            {t("The same records and actions over the Model Context Protocol, at")} <Code>{`${origin}/mcp`}</Code>{t(": an agent signs in with OAuth or a key, and acts with your rights.")}
          </p>
        </Card>
        <Card title={t("Events")}>
          <p>
            {t("What changed, as webhooks signed with a secret (")}<Code>{t("X-Ferrum-Signature")}</Code>{t("), or to an app that runs on your own servers. The")} <NavLink to="/events">events</NavLink> {t("page lists each record's topics.")}
          </p>
          {admin && <a href="/admin/?tab=webhooks">{t("Webhooks in Administration")}</a>}
        </Card>
        <Card title={t("Apps of your own")}>
          <p>
            {t("Metadata, a sandboxed WebAssembly plugin, or a service on your servers (")}<Code>{t("runtime: service")}</Code>{t("): the SDK and its CLI build, sign and publish them to a store.")}
          </p>
          <a href="https://github.com/CBFerrum/ferrum-sdk" target="_blank" rel="noreferrer">
            ferrum-sdk
          </a>
        </Card>
        <Card title={t("Your keys")}>
          <p>{t("A key acts as you, with your rights, until it expires or you revoke it.")}</p>
          <NavLink to="/keys">{t("Manage your keys")}</NavLink>
        </Card>
      </div>
    </Page>
  );
}

// ── API reference ──

const TRYABLE = new Set(["GET"]);

function Try({ op }: { op: Operation }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ status: string; body: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const { path, missing } = requestPath(op, values);
  const run = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = await request<unknown>(path);
      const text = typeof body === "string" ? body : JSON.stringify(body, null, 2);
      setResult({ status: "200", body: text.length > 20_000 ? `${text.slice(0, 20_000)}\n…` : text });
    } catch (err) {
      setResult({ status: "error", body: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };
  const fields = op.parameters.filter((p) => p.in === "path" || p.in === "query");
  return (
    <form className="stack hub-try" onSubmit={run}>
      {fields.map((p) => (
        <label key={`${p.in}.${p.name}`} className="hub-param">
          <span>
            {p.name} <span className="muted">{p.in}{p.required ? ", required" : ""}</span>
          </span>
          <input className="input" aria-label={p.name} value={values[p.name] ?? ""} onChange={(e) => setValues({ ...values, [p.name]: e.target.value })} />
        </label>
      ))}
      <div className="row" style={{ gap: 8 }}>
        <Button type="submit" variant="primary" size="sm" loading={busy} disabled={missing.length > 0}>
          {t("Send")}
        </Button>
        <Code>{path}</Code>
      </div>
      {result && (
        <div className="stack">
          <span className="muted">{result.status === "200" ? "The answer, as you would get it:" : "Refused:"}</span>
          <pre className="hub-pre">{result.body}</pre>
        </div>
      )}
    </form>
  );
}

function OperationRow({ op }: { op: Operation }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="hub-op">
      <button type="button" className="hub-op-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Badge tone={op.method === "GET" ? "blue" : op.method === "DELETE" ? "red" : "green"}>{op.method}</Badge>
        <span className="mono">{op.path}</span>
        {op.summary && <span className="muted">{op.summary}</span>}
      </button>
      {open && (
        <div className="hub-op-body stack">
          {op.parameters.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>{t("Parameter")}</th>
                  <th>{t("In")}</th>
                  <th>{t("Type")}</th>
                </tr>
              </thead>
              <tbody>
                {op.parameters.map((p) => (
                  <tr key={`${p.in}.${p.name}`}>
                    <td className="mono">
                      {p.name}
                      {p.required ? " *" : ""}
                    </td>
                    <td>{p.in}</td>
                    <td>{p.schema?.format ?? p.schema?.type ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {op.body && <p className="muted">{t("Takes a JSON body: the record's fields.")}</p>}
          {TRYABLE.has(op.method) ? <Try op={op} /> : <p className="muted">{t("Changes are made from your own code: this page only reads.")}</p>}
        </div>
      )}
    </li>
  );
}

export function Reference() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const spec = useQuery({ queryKey: ["openapi"], queryFn: ({ signal }) => api.get<Parameters<typeof operations>[0]>("/api/openapi.json", undefined, signal) });
  const ops = useMemo(() => (spec.data ? operations(spec.data) : []), [spec.data]);
  const found = useMemo(() => search(ops, q), [ops, q]);
  const tags = useMemo(() => [...new Set(found.map((o) => o.tag))], [found]);
  return (
    <Page title={t("API reference")}>
      <input
        className="input hub-search"
        type="search"
        placeholder={t("Find an operation: an entity, a path, an action")}
        aria-label={t("Find an operation")}
        value={q}
        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
      />
      {spec.isPending ? (
        <PageLoading />
      ) : spec.isError ? (
        <ErrorState error={spec.error} onRetry={() => void spec.refetch()} />
      ) : !found.length ? (
        <EmptyState title={t("Nothing matches")} />
      ) : (
        <>
          <p className="muted">
            {t("{length} of {length2} operations, for the records you may see.", { length: found.length, length2: ops.length })}
          </p>
          {tags.map((tag) => (
            <section key={tag} className="stack">
              <h2 className="hub-tag">{tag}</h2>
              <ul className="hub-ops">
                {found
                  .filter((o) => o.tag === tag)
                  .map((o) => (
                    <OperationRow key={o.id} op={o} />
                  ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </Page>
  );
}

// ── events ──

interface EntityMeta {
  name: string;
  label: string;
  kind: string;
  submittable?: boolean;
}

export function Events() {
  const meta = useQuery({ queryKey: ["meta-index"], queryFn: ({ signal }) => api.get<{ entities: EntityMeta[] }>("/api/meta", undefined, signal) });
  const [q, setQ] = useState("");
  const entities = (meta.data?.entities ?? []).filter((e) => e.kind !== "child" && `${e.name} ${e.label}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Page title={t("Events")}>
      <p className="muted">
        {t("A webhook or a service app names the topics it hears of:")} <span className="mono">{t("Entity.event")}</span>, <span className="mono">{t("Entity.*")}</span> or{" "}
        <span className="mono">*</span>{t(". A webhook's delivery carries the record; a service app's names it, and the app reads it with its key.")}
      </p>
      <pre className="hub-pre">{`{"entity": "Customer", "id": "…", "event": "created", "actor": "…", "doc": {…}}`}</pre>
      <input className="input hub-search" type="search" placeholder={t("Find a record type")} aria-label={t("Find a record type")} value={q} onChange={(e) => setQ(e.target.value)} />
      {meta.isPending ? (
        <PageLoading />
      ) : meta.isError ? (
        <ErrorState error={meta.error} onRetry={() => void meta.refetch()} />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{t("Records")}</th>
              <th>{t("Topics")}</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.name}>
                <td>{e.label}</td>
                <td className="mono">{topics(e.name, !!e.submittable).join("  ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Page>
  );
}

// ── keys ──

interface Key {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  scope: string | null;
}

export function Keys() {
  const qc = useQueryClient();
  const keys = useQuery({ queryKey: ["keys"], queryFn: ({ signal }) => api.get<{ keys: Key[] }>("/api/auth/api_keys", undefined, signal) });
  const [name, setName] = useState("");
  const [days, setDays] = useState("90");
  const [made, setMade] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: () =>
      api.post<{ key: string }>("/api/auth/api_keys", {
        name: name.trim(),
        expires_at: days ? new Date(Date.now() + Number(days) * 86_400_000).toISOString() : null,
      }),
    onSuccess: (r) => {
      setMade(r.key);
      setName("");
      void qc.invalidateQueries({ queryKey: ["keys"] });
    },
    onError: (e) => toast(errorMessage(e), "error"),
  });
  const revoke = async (k: Key) => {
    if (!(await confirmDialog({ title: `Revoke ${k.name}?`, message: "Whatever uses it stops working at once.", confirmLabel: "Revoke", danger: true }))) return;
    try {
      await api.del(`/api/auth/api_keys/${k.id}`);
      // A key just made and shown goes from the page too once anything is revoked.
      setMade(null);
      toast(t("Key revoked"));
      void qc.invalidateQueries({ queryKey: ["keys"] });
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };
  const live = (keys.data?.keys ?? []).filter((k) => !k.revoked_at);
  return (
    <Page title={t("Your keys")}>
      <form
        className="card card-pad stack hub-new-key"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <h2>{t("A new key")}</h2>
        <label className="hub-param" htmlFor="key-name">
          <span>{t("What it is for")}</span>
          <input id="key-name" className="input" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Nightly export")} />
        </label>
        <label className="hub-param" htmlFor="key-expires">
          <span>{t("Expires after")}</span>
          <select id="key-expires" className="select" value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="30">{t("30 days")}</option>
            <option value="90">{t("90 days")}</option>
            <option value="365">{t("a year")}</option>
            <option value="">never</option>
          </select>
        </label>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <Button type="submit" variant="primary" loading={create.isPending} disabled={!name.trim()}>
            {t("Make the key")}
          </Button>
        </div>
        {made && (
          <Alert tone="success">
            <div className="stack">
              <span>{t("Copy it now: it is not shown again.")}</span>
              <Code>{made}</Code>
            </div>
          </Alert>
        )}
      </form>
      {keys.isPending ? (
        <PageLoading />
      ) : keys.isError ? (
        <ErrorState error={keys.error} onRetry={() => void keys.refetch()} />
      ) : !live.length ? (
        <EmptyState title={t("No keys yet")} />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{t("Key")}</th>
              <th>{t("Made")}</th>
              <th>{t("Last used")}</th>
              <th>{t("Expires")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {live.map((k) => (
              <tr key={k.id}>
                <td>
                  {k.name} <span className="mono muted">{k.prefix}</span> {k.scope && <Badge>{k.scope}</Badge>}
                </td>
                <td>{formatDateTime(k.created_at)}</td>
                <td>{k.last_used_at ? formatDateTime(k.last_used_at) : "never"}</td>
                <td>{k.expires_at ? formatDateTime(k.expires_at) : "never"}</td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => void revoke(k)} aria-label={`Revoke ${k.name}`}>
                    {t("Revoke")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Page>
  );
}
