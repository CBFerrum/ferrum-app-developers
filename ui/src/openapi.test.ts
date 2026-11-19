import { describe, expect, it } from "vitest";
import { operations, requestPath, search, topics } from "./openapi";

const spec = {
  paths: {
    "/api/v1/Customer": { get: { tags: ["Customer"], summary: "List" }, post: { tags: ["Customer"], requestBody: {} } },
    "/api/v1/Customer/{id}": {
      get: { tags: ["Customer"], parameters: [{ name: "id", in: "path" as const, required: true }, { name: "fields", in: "query" as const }] },
      delete: { tags: ["Customer"] },
    },
    "/api/v1/Address": { get: { tags: ["Address"] } },
  },
};

describe("the reference", () => {
  it("lists operations by tag, path and method", () => {
    expect(operations(spec).map((o) => o.id)).toEqual([
      "get /api/v1/Address",
      "get /api/v1/Customer",
      "post /api/v1/Customer",
      "get /api/v1/Customer/{id}",
      "delete /api/v1/Customer/{id}",
    ]);
    expect(operations(spec)[2].body).toBe(true);
  });

  it("finds operations by every word", () => {
    expect(search(operations(spec), "customer delete").map((o) => o.id)).toEqual(["delete /api/v1/Customer/{id}"]);
    expect(search(operations(spec), "")).toHaveLength(5);
  });

  it("fills a path's parameters, encoded, and says what is missing", () => {
    const op = operations(spec).find((o) => o.id === "get /api/v1/Customer/{id}")!;
    expect(requestPath(op, {})).toEqual({ path: "/api/v1/Customer/{id}", missing: ["id"] });
    expect(requestPath(op, { id: "a b", fields: "name, email" })).toEqual({ path: "/api/v1/Customer/a%20b?fields=name%2C%20email", missing: [] });
  });

  it("takes a path item's parameters, the operation's winning", () => {
    const ops = operations({
      paths: {
        "/api/v1/Customer/{id}": {
          parameters: [{ name: "id", in: "path" as const, required: true, description: "path item's" }],
          get: { tags: ["Customer"] },
          patch: { tags: ["Customer"], parameters: [{ name: "id", in: "path" as const, required: true, description: "its own" }, { name: "If-Match", in: "header" as const }] },
        },
      },
    });
    expect(ops.find((o) => o.method === "GET")!.parameters.map((p) => p.description)).toEqual(["path item's"]);
    expect(ops.find((o) => o.method === "PATCH")!.parameters.map((p) => `${p.name}:${p.description ?? ""}`)).toEqual(["id:its own", "If-Match:"]);
  });

  it("names a record's topics, opened for every record, submissions only where it submits", () => {
    expect(topics("Customer", false)).toEqual(["Customer.created", "Customer.updated", "Customer.deleted", "Customer.opened"]);
    expect(topics("SalesInvoice", true)).toContain("SalesInvoice.cancelled");
  });
});
