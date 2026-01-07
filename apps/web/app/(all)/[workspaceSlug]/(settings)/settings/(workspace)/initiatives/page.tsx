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
import { InitiativeIcon } from "@plane/propel/icons";
import { setPromiseToast } from "@plane/propel/toast";
import { EUserWorkspaceRoles } from "@plane/types";
// component
import { ToggleSwitch } from "@plane/ui";
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { SettingsHeading } from "@/components/settings/heading";
// store hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";

// plane web imports
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { InitiativeLabelList } from "@/plane-web/components/initiatives/components/labels/initiative-label-list";
import { InitiativesUpgrade } from "@/plane-web/components/initiatives/upgrade";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import type { Route } from "./+types/page";

function InitiativesSettingsPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  // store hooks
  const { getWorkspaceRoleByWorkspaceSlug } = useUserPermissions();
  const { currentWorkspace } = useWorkspace();
  const { isWorkspaceFeatureEnabled, updateWorkspaceFeature } = useWorkspaceFeatures();
  const { t } = useTranslation();

  // derived values
  const currentWorkspaceRole = getWorkspaceRoleByWorkspaceSlug(workspaceSlug);
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - Initiatives` : undefined;
  const isAdmin = currentWorkspaceRole === EUserWorkspaceRoles.ADMIN;
  const isInitiativesFeatureEnabled = isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_INITIATIVES_ENABLED);

  if (!currentWorkspace?.id) return <></>;

  if (!isAdmin) return <NotAuthorizedView section="settings" className="h-auto" />;

  const toggleInitiativesFeature = async () => {
    try {
      const payload = {
        [EWorkspaceFeatures.IS_INITIATIVES_ENABLED]: !isInitiativesFeatureEnabled,
      };
      const toggleInitiativesFeaturePromise = updateWorkspaceFeature(workspaceSlug, payload);
      setPromiseToast(toggleInitiativesFeaturePromise, {
        loading: t("project_settings.initiatives.toast.updating"),
        success: {
          title: t("toast.success"),
          message: () =>
            `${isInitiativesFeatureEnabled ? t("project_settings.initiatives.toast.disable_success") : t("project_settings.initiatives.toast.enable_success")}`,
        },
        error: {
          title: t("toast.error"),
          message: () => t("project_settings.initiatives.toast.error"),
        },
      });
      await toggleInitiativesFeaturePromise;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SettingsContentWrapper>
      <div className="w-full">
        <PageHead title={pageTitle} />
        <SettingsHeading
          title={t("workspace_settings.settings.initiatives.heading")}
          description={t("workspace_settings.settings.initiatives.description")}
        />
        <WithFeatureFlagHOC
          flag="INITIATIVES"
          fallback={<InitiativesUpgrade workspaceSlug={workspaceSlug} redirect />}
          workspaceSlug={workspaceSlug}
        >
          <div className=" py-6 flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-layer-1 rounded-md flex items-center justify-center">
                <InitiativeIcon className="size-5 text-tertiary" />
              </div>
              <div className="leading-tight">
                <h5 className="font-medium">{t("project_settings.initiatives.title")}</h5>
                <span className="text-placeholder text-13">{t("project_settings.initiatives.description")}</span>
              </div>
            </div>
            <ToggleSwitch value={isInitiativesFeatureEnabled} onChange={toggleInitiativesFeature} size="sm" />
          </div>

          <div className="py-6">
            <InitiativeLabelList />
          </div>
        </WithFeatureFlagHOC>
      </div>
    </SettingsContentWrapper>
  );
}

export default observer(InitiativesSettingsPage);
