// The Developer Hub's own interface (Ferrum docs/plan/apps-ui.md §13), at /developers/: what this
// workspace offers someone building on it, its API reference, the events it gives and the
// person's keys. Everything it shows comes from the platform's own APIs, as the person.

import { mountApp } from "@ferrum/records/frame";
import { routes } from "./routes";
import "./styles.css";

mountApp({
  route: "developers",
  catalogs: { ar: () => import("./locales/ar.json"), hi: () => import("./locales/hi.json") },
  routes,
});
