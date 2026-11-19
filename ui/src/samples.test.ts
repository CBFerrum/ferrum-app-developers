import { describe, expect, it } from "vitest";
import { operations } from "./openapi";
import { LANGS, sample, sampleRequest, skeleton } from "./samples";

// The shape of the workspace's document (server/src/openapi.rs): a create's body is a reference to the record's schema.
const spec = {
  paths: {
    "/api/v1/Customer": {
      get: { tags: ["Customer"], parameters: [{ name: "limit", in: "query" as const }] },
      post: { tags: ["Customer"], parameters: [{ name: "Idempotency-Key", in: "header" as const }], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Customer" } } } } },
    },
    "/api/v1/Customer/{id}": {
      parameters: [{ name: "id", in: "path" as const, required: true }],
      patch: { tags: ["Customer"], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Customer" } } } } },
      delete: { tags: ["Customer"] },
    },
  },
  components: {
    schemas: {
      Customer: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", readOnly: true },
          customer_name: { type: "string" },
          credit_limit: { type: "string", format: "decimal" },
          active: { type: "boolean" },
          kind: { type: "string", enum: ["Company", "Individual"] },
          since: { type: "string", format: "date" },
          api_secret: { type: ["string", "boolean", "null"], writeOnly: true },
          total_billed: { type: "string", format: "decimal", readOnly: true },
          notes: { type: "string" },
        },
        required: ["customer_name", "credit_limit", "active", "kind", "since", "api_secret", "total_billed"],
      },
    },
  },
};
const ops = operations(spec);
const op = (id: string) => ops.find((o) => o.id === id)!;
const ORIGIN = "https://acme.example";

describe("code samples", () => {
  it("a create in curl carries the key placeholder, an Idempotency-Key and the body", () => {
    const text = sample(sampleRequest(op("post /api/v1/Customer"), {}), "curl", ORIGIN);
    expect(text).toContain("curl -X POST 'https://acme.example/api/v1/Customer'");
    expect(text).toContain(`-H "Authorization: Bearer $FERRUM_KEY"`);
    expect(text).toContain(`-H "Idempotency-Key: $(uuidgen)"`);
    expect(text).toContain(`"customer_name": ""`);
  });

  it("the body holds required writable fields only, with a placeholder by type, and no secret", () => {
    expect(skeleton(op("post /api/v1/Customer").bodySchema)).toEqual({ customer_name: "", credit_limit: "0.00", active: false, kind: "Company", since: "2026-01-31" });
  });

  it("every language sends the same method, address, headers and body", () => {
    const req = sampleRequest(op("patch /api/v1/Customer/{id}"), { id: "c-1" });
    for (const lang of LANGS) {
      const text = sample(req, lang, ORIGIN);
      expect(text, lang).toContain("PATCH");
      expect(text, lang).toContain("https://acme.example/api/v1/Customer/c-1");
      for (const [name] of req.headers) expect(text, `${lang} ${name}`).toContain(name);
      expect(text, lang).toContain(JSON.stringify(req.body, null, 2));
      expect(text, lang).toContain("FERRUM_KEY");
    }
  });

  it("an update and a delete carry If-Match; a read carries no body and no key of its own", () => {
    expect(sampleRequest(op("patch /api/v1/Customer/{id}"), {}).headers.map(([n]) => n)).toContain("If-Match");
    expect(sampleRequest(op("delete /api/v1/Customer/{id}"), {}).headers.map(([n]) => n)).toEqual(["Authorization", "If-Match"]);
    const read = sampleRequest(op("get /api/v1/Customer"), { limit: "5" });
    expect([read.path, read.body, read.headers.map(([n]) => n)]).toEqual(["/api/v1/Customer?limit=5", undefined, ["Authorization"]]);
  });

  it("path and query values are encoded as the request is, and an address still to fill is not globbed by curl", () => {
    const req = sampleRequest(op("delete /api/v1/Customer/{id}"), { id: "a b" });
    expect(req.path).toBe("/api/v1/Customer/a%20b");
    expect(sample(sampleRequest(op("delete /api/v1/Customer/{id}"), {}), "curl", ORIGIN)).toContain("curl -g -X DELETE 'https://acme.example/api/v1/Customer/{id}'");
  });

  it("the key is read from FERRUM_KEY, never written in", () => {
    const req = sampleRequest(op("get /api/v1/Customer"), {});
    expect(sample(req, "javascript", ORIGIN)).toContain("`Bearer ${process.env.FERRUM_KEY}`");
    expect(sample(req, "python", ORIGIN)).toContain(`f"Bearer {os.environ['FERRUM_KEY']}"`);
    for (const lang of LANGS) expect(sample(req, lang, ORIGIN)).not.toMatch(/fk_[a-z0-9]/);
  });
});
