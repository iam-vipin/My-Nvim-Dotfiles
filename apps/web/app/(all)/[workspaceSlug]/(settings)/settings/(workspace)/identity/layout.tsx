// plane imports
import { Outlet } from "react-router";
import { EUserPermissionsLevel } from "@plane/constants";
import { EUserWorkspaceRoles } from "@plane/types";
// component
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";
// plane web components
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags/with-feature-flag-hoc";
import { IdentityUpgrade } from "@/plane-web/components/workspace/settings/identity/upgrade";
import { useDomains } from "@/plane-web/hooks/sso/use-domains";
import { useProviders } from "@/plane-web/hooks/sso/use-providers";
// types
import type { Route } from "./+types/layout";

function IdentityLayout({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  // store hooks
  const { getWorkspaceBySlug } = useWorkspace();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const currentWorkspace = getWorkspaceBySlug(workspaceSlug);
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Identity` : undefined;
  const hasWorkspaceAdminPermission = allowPermissions(
    [EUserWorkspaceRoles.ADMIN],
    EUserPermissionsLevel.WORKSPACE,
    workspaceSlug
  );
  // fetch domains and providers
  useDomains(workspaceSlug);
  useProviders(workspaceSlug);

  if (!hasWorkspaceAdminPermission) return <NotAuthorizedView section="settings" className="h-auto" />;

  return (
    <SettingsContentWrapper size={"md"}>
      <PageHead title={pageTitle} />
      <WithFeatureFlagHOC flag="CLOUD_SSO" fallback={<IdentityUpgrade />} workspaceSlug={workspaceSlug}>
        <Outlet />
      </WithFeatureFlagHOC>
    </SettingsContentWrapper>
  );
}

export default IdentityLayout;
