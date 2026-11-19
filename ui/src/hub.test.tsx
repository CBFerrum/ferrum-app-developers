// @vitest-environment jsdom
// The hub's real route table, mounted, with the platform's answers stubbed as a running server gives them
// (`/api/openapi.json` puts a record's `id` on the path item, server/src/openapi.rs; `/api/auth/api_keys`).

import { beforeEach, describe, expect, it } from "vitest";
import { answers, asked, button, click, open, type } from "./testkit";

const spec = {
  paths: {
    "/api/v1/Customer/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      get: { tags: ["Customer"] },
    },
  },
};
const day = 86_400_000;
const key = (name: string, expires: number | null) => ({
  id: name,
  name,
  prefix: "fk_abc_…",
  created_at: new Date(Date.now() - 10 * day).toISOString(),
  expires_at: expires === null ? null : new Date(Date.now() + expires).toISOString(),
  revoked_at: null,
  last_used_at: null,
  scope: null,
});
beforeEach(() => {
  answers["/api/openapi.json"] = spec;
  answers["/api/auth/api_keys"] = { keys: [key("Nightly export", 30 * day), key("Old import", -day)] };
});

describe("the reference", () => {
  it("a record can be tried by its id", async () => {
    const { host, close } = await open("/reference");
    await click(button(host, "/api/v1/Customer/{id}"));
    const field = host.querySelector(".hub-op-body form input");
    const send = () => button(host, "Send") as HTMLButtonElement;
    expect(send().disabled).toBe(true);
    await type(field, "0193a1b2-0000-7000-8000-000000000001");
    expect(send().disabled).toBe(false);
    await click(send());
    expect(asked.map((a) => a.path)).toContain("/api/v1/Customer/0193a1b2-0000-7000-8000-000000000001");
    await close();
  });
});

describe("code samples", () => {
  it("an operation shows its sample in the language chosen", async () => {
    answers["/api/openapi.json"] = {
      paths: { "/api/v1/Customer": { post: { tags: ["Customer"], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Customer" } } } } } } },
      components: { schemas: { Customer: { type: "object", properties: { customer_name: { type: "string" } }, required: ["customer_name"] } } },
    };
    const { host, close } = await open("/reference");
    await click(button(host, "POST/api/v1/Customer"));
    const code = () => host.querySelector(".hub-op-body pre")?.textContent ?? "";
    expect(code()).toContain("curl -X POST");
    expect(code()).toContain('"customer_name": ""');
    await click(button(host, "Python"));
    expect(code()).toContain('requests.request("POST"');
    await click(button(host, "JavaScript"));
    expect(code()).toContain("await fetch(");
    await close();
  });
});

describe("your keys", () => {
  it("an expired key says so", async () => {
    const { host, close } = await open("/keys");
    const rows = [...host.querySelectorAll("tbody tr")].map((r) => r.textContent ?? "");
    expect(rows.find((r) => r.includes("Old import"))).toContain("Expired");
    expect(rows.find((r) => r.includes("Nightly export"))).not.toContain("Expired");
    await close();
  });
});
