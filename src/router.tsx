import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { AuthState } from "./lib/auth";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });

  // Real auth state is provided via <AuthProvider>; this is a placeholder that
  // routes read via useRouteContext. beforeLoad guards read auth from the
  // provider by reading window.__auth (see AuthProvider) — but for TanStack
  // we use component-level guards to keep SSR-safe.
  const auth: AuthState = {
    isAuthenticated: false,
    user: null,
    login: async () => {},
    logout: () => {},
  };

  const router = createRouter({
    routeTree,
    context: { queryClient, auth },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
