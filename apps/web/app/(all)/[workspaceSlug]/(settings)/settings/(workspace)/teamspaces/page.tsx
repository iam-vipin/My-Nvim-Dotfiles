import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { TeamsIcon } from "@plane/propel/icons";
import { setPromiseToast } from "@plane/propel/toast";
import { EUserWorkspaceRoles } from "@plane/types";
import { ToggleSwitch, Tooltip } from "@plane/ui";
// component
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { SettingsHeading } from "@/components/settings/heading";
// store hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { TeamspaceUpgrade } from "@/plane-web/components/teamspaces/upgrade";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import type { Route } from "./+types/page";

function TeamspaceSettingsPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  // store hooks
  const { getWorkspaceRoleByWorkspaceSlug } = useUserPermissions();
  const { currentWorkspace } = useWorkspace();
  const { isWorkspaceFeatureEnabled, updateWorkspaceFeature } = useWorkspaceFeatures();
  const { t } = useTranslation();

  // derived values
  const currentWorkspaceRole = getWorkspaceRoleByWorkspaceSlug(workspaceSlug);
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Teamspaces` : undefined;
  const isAdmin = currentWorkspaceRole === EUserWorkspaceRoles.ADMIN;
  const isTeamspacesFeatureEnabled = isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_TEAMSPACES_ENABLED);

  if (!currentWorkspace?.id) return <></>;

  if (!isAdmin) return <NotAuthorizedView section="settings" className="h-auto" />;

  const toggleTeamsFeature = async () => {
    try {
      const payload = {
        [EWorkspaceFeatures.IS_TEAMSPACES_ENABLED]: !isTeamspacesFeatureEnabled,
      };
      const toggleTeamsFeaturePromise = updateWorkspaceFeature(workspaceSlug, payload);
      setPromiseToast(toggleTeamsFeaturePromise, {
        loading: "Updating teamspaces feature...",
        success: {
          title: "Success",
          message: () => `Teamspaces feature ${isTeamspacesFeatureEnabled ? "disabled" : "enabled"} successfully!`,
        },
        error: {
          title: "Error",
          message: () => "Failed to update teamspaces feature!",
        },
      });
      await toggleTeamsFeaturePromise;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SettingsContentWrapper>
      <PageHead title={pageTitle} />
      <SettingsHeading
        title={t("workspace_settings.settings.teamspaces.heading")}
        description={t("workspace_settings.settings.teamspaces.description")}
      />
      <WithFeatureFlagHOC flag="TEAMSPACES" fallback={<TeamspaceUpgrade />} workspaceSlug={workspaceSlug}>
        <div className="px-4 py-6 flex items-center justify-between gap-2 border-b border-subtle w-full">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-layer-1 rounded-md flex items-center justify-center">
              <TeamsIcon className="size-5 text-tertiary" />
            </div>
            <div className="leading-tight">
              <h5 className="font-medium">Turn on Teamspaces for this workspace.</h5>
              <span className="text-tertiary text-body-xs-regular">
                Once turned on, you can&apos;t turn this feature off.
              </span>
            </div>
          </div>
          <Tooltip
            tooltipContent={"Teamspaces can't be disabled"}
            disabled={!isTeamspacesFeatureEnabled}
            position="left"
          >
            <div>
              <ToggleSwitch
                value={isTeamspacesFeatureEnabled}
                onChange={toggleTeamsFeature}
                size="sm"
                disabled={isTeamspacesFeatureEnabled}
              />
            </div>
          </Tooltip>
        </div>
      </WithFeatureFlagHOC>
    </SettingsContentWrapper>
  );
}

export default observer(TeamspaceSettingsPage);
