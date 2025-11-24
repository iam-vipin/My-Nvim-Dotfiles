import { route } from "@react-router/dev/routes";
import type { RouteConfigEntry } from "@react-router/dev/routes";

export const extendedRedirectRoutes: RouteConfigEntry[] = [
  // ========================================================================
  // WIKI REDIRECTS
  // ========================================================================

  // Pages to Wiki redirect: /:workspaceSlug/pages/:path*
  // → /:workspaceSlug/wiki/:path*
  route(":workspaceSlug/pages/*", "routes/redirects/extended/wiki.tsx"),
];
