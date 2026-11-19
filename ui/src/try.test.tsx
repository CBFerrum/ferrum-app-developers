// @vitest-environment jsdom
// Trying a change from the reference: a real run, as the signed-in person, through the same routes the record
// screens use. It is asked first, naming the operation, the record and that it is real; it is sent once with its
// Idempotency-Key; an operation the record screens would not run without more (an outside effect, an action with no
// contract, a delete, a submit or a cancel) is not offered here.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { answers, asked, button, click, open, type } from "./testkit";

const confirm = vi.hoisted(() => ({ answer: true, asked: [] as { title: string; message: string }[] }));
vi.mock("@ferrum/kit", async (original) => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const kit = await original<typeof import("@ferrum/kit")>();
  return {
    ...kit,
    confirmDialog: async (o: { title: string; message?: unknown }) => {
      const message = typeof o.message === "string" ? o.message : renderToStaticMarkup(o.message as never).replace(/<[^>]*>/g, "");
      confirm.asked.push({ title: o.title, message });
      return confirm.answer;
    },
  };
});

const ref = (name: string) => ({ content: { "application/json": { schema: { $ref: `#/components/schemas/${name}` } } } });
const spec = {
  paths: {
    "/api/v1/Customer": { post: { tags: ["Customer"], summary: "Create Customer", requestBody: ref("Customer") } },
    "/api/v1/Customer/{id}": {
      parameters: [{ name: "id", in: "path", required: true }],
      patch: { tags: ["Customer"], requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/Customer" } } } } },
      delete: { tags: ["Customer"] },
    },
    "/api/v1/Customer/{id}/actions/block": { post: { tags: ["Customer"], summary: "Block", parameters: [{ name: "id", in: "path", required: true }] } },
    "/api/v1/Customer/{id}/actions/sync": { post: { tags: ["Customer"], summary: "Send to the bank", parameters: [{ name: "id", in: "path", required: true }] } },
    "/api/v1/Customer/{id}/actions/legacy": { post: { tags: ["Customer"], summary: "Legacy", parameters: [{ name: "id", in: "path", required: true }] } },
    "/api/v1/SalesInvoice/{id}/submit": { post: { tags: ["SalesInvoice"], parameters: [{ name: "id", in: "path", required: true }] } },
  },
  components: { schemas: { Customer: { type: "object", properties: { customer_name: { type: "string" } }, required: ["customer_name"] } } },
};
const meta = {
  name: "Customer",
  actions: [
    { name: "block", label: "Block", confirm: "Blocked customers cannot be invoiced.", params: [{ name: "reason", label: "Reason", type: "data", required: true }, { name: "pin", label: "PIN", type: "data", required: true, secret: true }], contract: { effect: "transactional_action" } },
    { name: "sync", label: "Send to the bank", contract: { effect: "external_effect" } },
    { name: "legacy", label: "Legacy" },
  ],
};
const ID = "0193a1b2-0000-7000-8000-000000000001";

beforeEach(() => {
  confirm.answer = true;
  confirm.asked.length = 0;
  answers["/api/openapi.json"] = spec;
  answers["/api/meta/Customer"] = meta;
  answers["/api/v1/Customer"] = (method: string) => (method === "POST" ? { id: ID, customer_name: "Globex", version: 1 } : { rows: [] });
  answers[`/api/v1/Customer/${ID}`] = { id: ID, version: 2 };
  answers[`/api/v1/Customer/${ID}/actions/block`] = { ok: true };
});

const opRow = async (host: HTMLElement, label: string) => click(button(host, label));
const body = (host: HTMLElement) => host.querySelector(".hub-op-body textarea");
const changes = () => asked.filter((a) => a.method !== "GET");

describe("trying a change", () => {
  it("asks first, naming the operation, the record and that it is real, and sends nothing when cancelled", async () => {
    confirm.answer = false;
    const { host, close } = await open("/reference");
    await opRow(host, "/api/v1/Customer/{id}/actions/block");
    await type(host.querySelector(".hub-op-body form input"), ID);
    await click(button(host, "Send"));
    expect(confirm.asked).toHaveLength(1);
    const { title, message } = confirm.asked[0];
    expect(title).toContain("Block");
    expect(message).toContain(`Customer ${ID}`);
    expect(message).toContain("This is real");
    expect(message).toContain("Blocked customers cannot be invoiced.");
    expect(changes()).toEqual([]);
    await close();
  });

  it("never fills a secret parameter in", async () => {
    const { host, close } = await open("/reference");
    await opRow(host, "/api/v1/Customer/{id}/actions/block");
    const text = (body(host) as HTMLTextAreaElement).value;
    expect(JSON.parse(text)).toEqual({ reason: "" });
    await close();
  });

  it("a confirmed change is sent once with its key, If-Match and body", async () => {
    const { host, close } = await open("/reference");
    const patch = [...host.querySelectorAll(".hub-op")].find((li) => li.textContent?.includes("PATCH"))!;
    await click(patch.querySelector("button"));
    await type(patch.querySelector('input[name="id"]'), ID);
    await type(patch.querySelector('input[name="if-match"]'), "2");
    await type(patch.querySelector("textarea"), '{"customer_name": "Globex Ltd"}');
    await click(button(patch as HTMLElement, "Send"));
    expect(changes()).toHaveLength(1);
    const [sent] = changes();
    expect([sent.method, sent.path, sent.headers["if-match"], JSON.parse(sent.body ?? "null")]).toEqual(["PATCH", `/api/v1/Customer/${ID}`, '"v2"', { customer_name: "Globex Ltd" }]);
    expect(sent.headers["idempotency-key"]).toMatch(/.{8,}/);
    await close();
  });

  it("the same request sent again keeps its key; a changed body gets a new one", async () => {
    const { host, close } = await open("/reference");
    await opRow(host, "POST/api/v1/Customer");
    await type(body(host), '{"customer_name": "Globex"}');
    await click(button(host, "Send"));
    await click(button(host, "Send"));
    await type(body(host), '{"customer_name": "Initech"}');
    await click(button(host, "Send"));
    const keys = changes().map((a) => a.headers["idempotency-key"]);
    expect(keys).toHaveLength(3);
    expect(keys[0]).toBe(keys[1]);
    expect(keys[2]).not.toBe(keys[0]);
    await close();
  });

  it("a body that is not JSON is refused before asking", async () => {
    const { host, close } = await open("/reference");
    await opRow(host, "POST/api/v1/Customer");
    await type(body(host), "{customer_name: Globex");
    await click(button(host, "Send"));
    expect(confirm.asked).toEqual([]);
    expect(changes()).toEqual([]);
    expect(host.textContent).toContain("not JSON");
    await close();
  });

  it("a refusal is shown as the answer", async () => {
    answers["/api/v1/Customer"] = () => new Response(JSON.stringify({ error: "validation", message: "customer_name is required" }), { status: 422, headers: { "content-type": "application/json" } });
    const { host, close } = await open("/reference");
    await opRow(host, "POST/api/v1/Customer");
    await click(button(host, "Send"));
    expect(host.textContent).toContain("customer_name is required");
    await close();
  });

  it("an outside effect, an action with no contract, a delete and a submit are not offered", async () => {
    const { host, close } = await open("/reference");
    for (const label of ["/api/v1/Customer/{id}/actions/sync", "/api/v1/Customer/{id}/actions/legacy", "/api/v1/SalesInvoice/{id}/submit"]) {
      await opRow(host, label);
    }
    const del = [...host.querySelectorAll(".hub-op")].find((li) => li.textContent?.includes("DELETE"))!;
    await click(del.querySelector("button"));
    expect(host.querySelectorAll(".hub-op-body").length).toBe(4);
    for (const b of host.querySelectorAll(".hub-op-body")) {
      expect(b.querySelector("form"), b.textContent ?? "").toBeNull();
      expect(b.textContent).toContain("record's own screen");
    }
    expect(changes()).toEqual([]);
    await close();
  });
});
