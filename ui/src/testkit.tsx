// What the interface's tests share: the real route table mounted in jsdom, with the platform's answers
// stubbed by path as a running server gives them, and every request the page sends recorded.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, expect, vi } from "vitest";
import { routes } from "./routes";

/** The answer for a path (without its query), or a function of the request; absent: 404. */
export const answers: Record<string, unknown> = {};
export const asked: { method: string; path: string; headers: Record<string, string>; body: string | null }[] = [];

beforeEach(() => {
  asked.length = 0;
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  (globalThis as { matchMedia?: unknown }).matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input instanceof Request ? input.url : input), "http://localhost");
      const headers = Object.fromEntries(new Headers(init?.headers).entries());
      asked.push({ method: init?.method ?? "GET", path: url.pathname + url.search, headers, body: typeof init?.body === "string" ? init.body : null });
      let body = answers[url.pathname];
      if (typeof body === "function") body = body(init?.method ?? "GET", init?.body);
      if (body instanceof Response) return body;
      return new Response(JSON.stringify(body ?? { error: "not found" }), { status: body === undefined ? 404 : 200, headers: { "content-type": "application/json" } });
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  for (const k of Object.keys(answers)) delete answers[k];
});

const settle = async () => {
  for (let i = 0; i < 20; i++) await act(async () => void (await new Promise((r) => setTimeout(r, 10))));
};

/** Mounts the route table at `path`; the caller unmounts with the returned `close`. */
export async function open(path: string): Promise<{ host: HTMLElement; close: () => Promise<void> }> {
  const host = document.createElement("div");
  document.body.append(host);
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const root: Root = createRoot(host);
  await act(async () => {
    root.render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
  });
  await settle();
  return {
    host,
    close: async () => {
      await act(async () => root.unmount());
      host.remove();
    },
  };
}

export async function click(el: Element | null | undefined) {
  expect(el, "the control is there").toBeTruthy();
  await act(async () => (el as HTMLElement).click());
  await settle();
}

/** Types into a React-controlled input or textarea. */
export async function type(el: Element | null | undefined, value: string) {
  expect(el, "the field is there").toBeTruthy();
  const input = el as HTMLInputElement | HTMLTextAreaElement;
  const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await settle();
}

export const button = (host: HTMLElement, text: string) => [...host.querySelectorAll("button")].find((b) => (b.textContent ?? "").includes(text));

