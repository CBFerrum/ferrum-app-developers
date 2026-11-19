// Code samples for one operation of the workspace's document: the request the reference would send
// (`requestPath`, so path and query are encoded once), printed in curl, JavaScript and Python. A sample
// never holds a key: it reads one from the FERRUM_KEY environment variable. Headers follow docs/api.md:
// `Idempotency-Key` on a create, an update or an action, `If-Match: "v<version>"` on what changes a record.

import { requestPath, type Operation, type Schema } from "./openapi";

export const LANGS = ["curl", "javascript", "python"] as const;
export type Lang = (typeof LANGS)[number];

export interface SampleRequest {
  method: string;
  /** Path and query, encoded; a path parameter not given yet stays `{name}`. */
  path: string;
  /** In order; values are placeholders each language writes its own way (see `sample`). */
  headers: [string, string][];
  body?: unknown;
}

const IDEMPOTENCY = "$idempotency";
const KEY = "$key";

/** A placeholder for a value of `s`'s type. */
function placeholder(s: Schema): unknown {
  if (s.enum?.length) return s.enum[0];
  const type = Array.isArray(s.type) ? s.type[0] : s.type;
  if (type === "integer" || type === "number") return 0;
  if (type === "boolean") return false;
  if (type === "array") return [];
  if (type === "object" || type === undefined) return {};
  return { decimal: "0.00", date: "2026-01-31", "date-time": "2026-01-31T09:00:00Z", uuid: "<uuid>", email: "name@example.com", uri: "https://example.com" }[s.format ?? ""] ?? "";
}

/** A body to start from: the required fields a caller writes (not read-only), each a placeholder of its type.
 *  A secret (write-only) is never put in: the caller types it. */
export function skeleton(s: Schema | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const name of s?.required ?? []) {
    const f = s?.properties?.[name];
    if (f && !f.readOnly && !f.writeOnly) out[name] = placeholder(f);
  }
  return out;
}

/** The request an operation makes with `values` for its path and query parameters, and its body to start from. */
export function sampleRequest(op: Operation, values: Record<string, string>, body?: unknown): SampleRequest {
  const { path } = requestPath(op, values);
  const headers: [string, string][] = [["Authorization", KEY]];
  const last = op.path.split("/").pop();
  if (op.method === "POST" || op.method === "PATCH") headers.push(["Idempotency-Key", IDEMPOTENCY]);
  if (op.method === "PATCH" || op.method === "DELETE" || last === "submit" || last === "cancel") headers.push(["If-Match", '"v1"']);
  if (op.body) headers.push(["Content-Type", "application/json"]);
  return { method: op.method, path, headers, body: op.body ? (body ?? skeleton(op.bodySchema)) : undefined };
}

const json = (body: unknown) => JSON.stringify(body, null, 2);
const shellQuote = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

/** `req` in `lang`, against the workspace at `origin`. */
export function sample(req: SampleRequest, lang: Lang, origin: string): string {
  const url = `${origin}${req.path}`;
  const body = req.body === undefined ? undefined : json(req.body);
  if (lang === "curl") {
    const value = (v: string) => (v === KEY ? "Bearer $FERRUM_KEY" : v === IDEMPOTENCY ? "$(uuidgen)" : v.replace(/"/g, '\\"'));
    const lines = [`curl${url.includes("{") ? " -g" : ""} -X ${req.method} ${shellQuote(url)}`, ...req.headers.map(([n, v]) => `-H "${n}: ${value(v)}"`)];
    if (body !== undefined) lines.push(`--data ${shellQuote(body)}`);
    return lines.join(" \\\n  ");
  }
  if (lang === "javascript") {
    const value = (v: string) => (v === KEY ? "`Bearer ${process.env.FERRUM_KEY}`" : v === IDEMPOTENCY ? "crypto.randomUUID()" : JSON.stringify(v));
    const init = [`  method: "${req.method}",`, "  headers: {", ...req.headers.map(([n, v]) => `    "${n}": ${value(v)},`), "  },"];
    if (body !== undefined) init.push(`  body: JSON.stringify(${body}),`);
    return [`const res = await fetch(${JSON.stringify(url)}, {`, ...init, "});", "console.log(res.status, await res.text());"].join("\n");
  }
  const value = (v: string) => (v === KEY ? `f"Bearer {os.environ['FERRUM_KEY']}"` : v === IDEMPOTENCY ? "str(uuid.uuid4())" : JSON.stringify(v));
  const lines = ["import os, uuid", "import requests", "", `res = requests.request(${JSON.stringify(req.method)}, ${JSON.stringify(url)}, headers={`, ...req.headers.map(([n, v]) => `    "${n}": ${value(v)},`)];
  lines.push(body === undefined ? "})" : `}, data="""${body}""")`);
  lines.push("print(res.status_code, res.text)");
  return lines.join("\n");
}
