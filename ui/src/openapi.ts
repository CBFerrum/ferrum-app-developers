// What the Developer Hub reads of the workspace's OpenAPI document (`/api/openapi.json`, built from
// its metadata): operations by tag, a path with its parameters filled in, and the topics webhooks and
// service apps hear of.

export interface Parameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: { type?: string; format?: string; enum?: unknown[] };
}

export interface Operation {
  id: string;
  method: string;
  path: string;
  tag: string;
  summary: string;
  parameters: Parameter[];
  body: boolean;
}

interface Spec {
  paths?: Record<string, Record<string, { tags?: string[]; summary?: string; operationId?: string; parameters?: Parameter[]; requestBody?: unknown }>>;
}

const METHODS = ["get", "post", "put", "patch", "delete"];

/** Every operation of a document, sorted by tag, then path, then method. */
export function operations(spec: Spec): Operation[] {
  const out: Operation[] = [];
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;
      out.push({
        id: `${method} ${path}`,
        method: method.toUpperCase(),
        path,
        tag: op.tags?.[0] ?? "Other",
        summary: op.summary ?? "",
        parameters: op.parameters ?? [],
        body: op.requestBody !== undefined,
      });
    }
  }
  const order = (m: string) => METHODS.indexOf(m.toLowerCase());
  return out.sort((a, b) => a.tag.localeCompare(b.tag) || a.path.localeCompare(b.path) || order(a.method) - order(b.method));
}

/** Operations whose tag, path or summary hold every word of `q`. */
export function search(ops: Operation[], q: string): Operation[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return ops.filter((o) => words.every((w) => `${o.tag} ${o.path} ${o.summary} ${o.method}`.toLowerCase().includes(w)));
}

/** The request's path: path parameters filled in (encoded), query parameters that have a value. */
export function requestPath(op: Operation, values: Record<string, string>): { path: string; missing: string[] } {
  const missing: string[] = [];
  let path = op.path.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const v = values[name]?.trim();
    if (!v) {
      missing.push(name);
      return `{${name}}`;
    }
    return encodeURIComponent(v);
  });
  const query = op.parameters
    .filter((p) => p.in === "query" && values[p.name]?.trim())
    .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(values[p.name].trim())}`);
  if (query.length) path += `?${query.join("&")}`;
  return { path, missing };
}

/** The events a record of `entity` gives (`Entity.event`), which webhooks and service apps name. */
export const EVENTS = ["created", "updated", "deleted", "submitted", "cancelled"] as const;

export function topics(entity: string, submittable: boolean): string[] {
  return EVENTS.filter((e) => submittable || (e !== "submitted" && e !== "cancelled")).map((e) => `${entity}.${e}`);
}
