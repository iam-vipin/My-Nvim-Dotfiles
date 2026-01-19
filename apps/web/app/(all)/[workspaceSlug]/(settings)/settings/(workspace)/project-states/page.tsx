/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { EUserWorkspaceRoles } from "@plane/types";
import { ToggleSwitch } from "@plane/ui";
// components
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { SettingsHeading } from "@/components/settings/heading";
// store hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";
// plane web components
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import {
  WorkspaceProjectStatesUpgrade,
  WorkspaceProjectStatesRoot,
} from "@/plane-web/components/workspace-project-states";
// plane web constants
// plane web hooks
import { useFlag, useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import type { Route } from "./+types/page";

function WorklogsPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  // store hooks
  const { getWorkspaceRoleByWorkspaceSlug } = useUserPermissions();
  const { currentWorkspace } = useWorkspace();
  const { isWorkspaceFeatureEnabled, updateWorkspaceFeature } = useWorkspaceFeatures();
  const isFeatureEnabled = useFlag(workspaceSlug, "PROJECT_GROUPING");
  const { t } = useTranslation();

  // derived values
  const currentWorkspaceRole = getWorkspaceRoleByWorkspaceSlug(workspaceSlug);
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Project States` : undefined;
  const isAdmin = currentWorkspaceRole === EUserWorkspaceRoles.ADMIN;
  const isProjectGroupingEnabled = isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PROJECT_GROUPING_ENABLED);

  if (!currentWorkspace?.id) return <></>;

  if (!isAdmin) return <NotAuthorizedView section="settings" className="h-auto" />;

  const toggleProjectGroupingFeature = async () => {
    const willEnableProjectGrouping = !isProjectGroupingEnabled;
    try {
      const payload = {
        [EWorkspaceFeatures.IS_PROJECT_GROUPING_ENABLED]: willEnableProjectGrouping,
      };
      await updateWorkspaceFeature(workspaceSlug, payload);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SettingsContentWrapper>
      <div className="w-full">
        <PageHead title={pageTitle} />
        <SettingsHeading
          title={t("workspace_settings.settings.project_states.heading")}
          description={t("workspace_settings.settings.project_states.description")}
          appendToRight={
            <>
              {isFeatureEnabled && (
                <ToggleSwitch value={isProjectGroupingEnabled} onChange={toggleProjectGroupingFeature} size="sm" />
              )}
            </>
          }
        />
        <WithFeatureFlagHOC
          flag="PROJECT_GROUPING"
          fallback={<WorkspaceProjectStatesUpgrade />}
          workspaceSlug={workspaceSlug}
        >
          <main className="container mx-auto space-y-4 w-full">
            <WorkspaceProjectStatesRoot
              isProjectGroupingEnabled={isProjectGroupingEnabled}
              workspaceSlug={workspaceSlug}
              workspaceId={currentWorkspace?.id}
              toggleProjectGroupingFeature={toggleProjectGroupingFeature}
            />
          </main>
        </WithFeatureFlagHOC>
      </div>
    </SettingsContentWrapper>
  );
}

export default observer(WorklogsPage);
