// The Developer Hub's route table, apart from the page that mounts it, so a test can mount the real thing.

import { useEffect } from "react";
import { Link, Outlet, type RouteObject, useRouteError } from "react-router";
import { shell, t } from "@ferrum/client";
import { FormSkeleton, StatePanel } from "@ferrum/kit";
import { Events, Keys, Overview, Reference } from "./Hub";

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

export const routes: RouteObject[] = [
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
];
