"use client";

import React from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { E_FEATURE_FLAGS, WIKI_TRACKER_ELEMENTS, WIKI_TRACKER_EVENTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { WikiIcon } from "@plane/propel/icons";
import { setPromiseToast } from "@plane/propel/toast";
import { EUserWorkspaceRoles } from "@plane/types";
import { ToggleSwitch } from "@plane/ui";
// component
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { SettingsHeading } from "@/components/settings/heading";
// store hooks
import { captureClick, captureError, captureSuccess } from "@/helpers/event-tracker.helper";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { WikiSettingsUpgradeScreen } from "@/plane-web/components/wiki/settings-upgrade-screen";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";

const WikiSettingsPage = observer(() => {
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { getWorkspaceRoleByWorkspaceSlug } = useUserPermissions();
  const { currentWorkspace } = useWorkspace();
  const { isWorkspaceFeatureEnabled, updateWorkspaceFeature } = useWorkspaceFeatures();
  const { t } = useTranslation();

  // derived values
  const currentWorkspaceRole = getWorkspaceRoleByWorkspaceSlug(workspaceSlug.toString());
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Wiki` : undefined;
  const isAdmin = currentWorkspaceRole === EUserWorkspaceRoles.ADMIN;
  const isWikiFeatureEnabled = isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_WIKI_ENABLED);

  if (!workspaceSlug || !currentWorkspace?.id) return <></>;

  if (!isAdmin) return <NotAuthorizedView section="settings" className="h-auto" />;

  const toggleWikiFeature = async () => {
    try {
      captureClick({
        elementName: WIKI_TRACKER_ELEMENTS.SETTINGS_PAGE_TOGGLE_BUTTON,
      });
      const payload = {
        [EWorkspaceFeatures.IS_WIKI_ENABLED]: !isWikiFeatureEnabled,
      };
      const toggleWikiFeaturePromise = updateWorkspaceFeature(workspaceSlug.toString(), payload);
      setPromiseToast(toggleWikiFeaturePromise, {
        loading: "Updating Wiki feature...",
        success: {
          title: "Success",
          message: () => `Wiki feature ${isWikiFeatureEnabled ? "disabled" : "enabled"} successfully!`,
        },
        error: {
          title: "Error",
          message: () => "Failed to update Wiki feature!",
        },
      });
      await toggleWikiFeaturePromise;
      captureSuccess({
        eventName: WIKI_TRACKER_EVENTS.TOGGLE,
        payload: {
          workspace_slug: workspaceSlug.toString(),
          type: isWikiFeatureEnabled ? "disable" : "enable",
        },
      });
    } catch (error) {
      console.error(error);
      captureError({
        eventName: WIKI_TRACKER_EVENTS.TOGGLE,
        payload: {
          workspace_slug: workspaceSlug.toString(),
          type: isWikiFeatureEnabled ? "disable" : "enable",
        },
      });
    }
  };

  return (
    <SettingsContentWrapper>
      <PageHead title={pageTitle} />
      <SettingsHeading title="Wiki" description={t("workspace_settings.settings.wiki.description")} />
      <WithFeatureFlagHOC
        flag={E_FEATURE_FLAGS.WORKSPACE_PAGES}
        fallback={<WikiSettingsUpgradeScreen workspaceSlug={workspaceSlug?.toString()} />}
        workspaceSlug={workspaceSlug?.toString()}
      >
        <div className="px-4 py-6 flex items-center justify-between gap-2 border-b border-custom-border-100 w-full">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-custom-background-90 rounded-md flex items-center justify-center">
              <WikiIcon className="size-5 text-custom-text-300" />
            </div>
            <div className="leading-tight">
              <h5 className="font-medium">Turn on Wiki for this workspace.</h5>
              <span className="text-custom-sidebar-text-400 text-sm">
                Your new smart teammate, ready when you are.{" "}
              </span>
            </div>
          </div>

          <div>
            <ToggleSwitch value={isWikiFeatureEnabled} onChange={toggleWikiFeature} size="sm" />
          </div>
        </div>
      </WithFeatureFlagHOC>
    </SettingsContentWrapper>
  );
});

export default WikiSettingsPage;
