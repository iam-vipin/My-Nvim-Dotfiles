// plane web imports
import { SAMLRoot } from "@/plane-web/components/workspace/settings/identity/provider/saml/root";
// types
import type { Route } from "./+types/page";

export default function SAMLPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;

  return <SAMLRoot workspaceSlug={workspaceSlug} />;
}
