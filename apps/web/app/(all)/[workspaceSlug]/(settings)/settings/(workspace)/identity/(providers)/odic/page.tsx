// plane web imports
import { OIDCRoot } from "@/plane-web/components/workspace/settings/identity/provider/oidc/root";
// types
import type { Route } from "./+types/page";

export default function OIDCPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;

  return <OIDCRoot workspaceSlug={workspaceSlug} />;
}
