// The Developer Hub's own interface (Ferrum docs/plan/apps-ui.md §13), at /developers/: what this
// workspace offers someone building on it, its API reference, the events it gives and the
// person's keys. Everything it shows comes from the platform's own APIs, as the person.

import { useEffect } from "react";
import { Link, Outlet, useRouteError } from "react-router";
import { shell, t } from "@ferrum/client";
import { FormSkeleton, StatePanel } from "@ferrum/kit";
import { mountApp } from "@ferrum/records/frame";
import { Events, Keys, Overview, Reference } from "./Hub";
import "./styles.css";

function Frame() {
  useEffect(() => shell().ready(), []);
  return (
    <main id="main" className="hub-app">
      <Outlet />
    </main>
  );
}

function RouteError() {
  return <StatePanel kind="failed" error={useRouteError()} onRetry={() => window.location.reload()} />;
}

function NotFound() {
  return (
    <StatePanel kind="empty" title={t("Page not found")}>
      <Link to="/">{t("Go to the Developer Hub")}</Link>
    </StatePanel>
  );
}

mountApp({
  route: "developers",
  catalogs: { ar: () => import("./locales/ar.json"), hi: () => import("./locales/hi.json") },
  routes: [
    {
      path: "/",
      element: <Frame />,
      errorElement: <RouteError />,
      hydrateFallbackElement: <FormSkeleton />,
      children: [
        { index: true, element: <Overview /> },
        { path: "reference", element: <Reference /> },
        { path: "events", element: <Events /> },
        { path: "keys", element: <Keys /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
});
