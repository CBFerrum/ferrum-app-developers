// The Developer Hub's own interface (Ferrum docs/plan/apps-ui.md §13), at /developers/: what this
// workspace offers someone building on it, its API reference, the events it gives and the
// person's keys. Everything it shows comes from the platform's own APIs, as the person.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Link, Outlet, RouterProvider, useRouteError } from "react-router";
import { routeBase, shell } from "@ferrum/client";
import { ConfirmHost, EmptyState, ErrorState, Toaster } from "@ferrum/kit";
import { Events, Keys, Overview, Reference } from "./Hub";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 } },
});

function Frame() {
  useEffect(() => shell().ready(), []);
  return (
    <main id="main" className="hub-app">
      <Outlet />
    </main>
  );
}

function RouteError() {
  return <ErrorState error={useRouteError()} onRetry={() => window.location.reload()} />;
}

function NotFound() {
  return (
    <EmptyState title="Page not found">
      <Link to="/">Go to the Developer Hub</Link>
    </EmptyState>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Frame />,
      errorElement: <RouteError />,
      hydrateFallbackElement: <span />,
      children: [
        { index: true, element: <Overview /> },
        { path: "reference", element: <Reference /> },
        { path: "events", element: <Events /> },
        { path: "keys", element: <Keys /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  { basename: routeBase("developers") },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      <ConfirmHost />
    </QueryClientProvider>
  </StrictMode>,
);
