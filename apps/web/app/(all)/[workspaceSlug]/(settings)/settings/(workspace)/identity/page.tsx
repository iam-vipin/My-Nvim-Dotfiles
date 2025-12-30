// ee components
import { IdentityRoot } from "@/plane-web/components/workspace/settings/identity/root";
// types
import type { Route } from "./+types/page";

export default function IdentityPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;

  return <IdentityRoot workspaceSlug={workspaceSlug} />;
}
