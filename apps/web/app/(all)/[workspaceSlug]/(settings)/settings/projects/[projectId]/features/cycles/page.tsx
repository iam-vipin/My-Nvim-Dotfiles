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
import Link from "next/link";
// plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { ChevronLeftIcon } from "@plane/propel/icons";
import { setPromiseToast } from "@plane/propel/toast";
import { ToggleSwitch } from "@plane/ui";
// components
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { SettingsHeading } from "@/components/settings/heading";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { AutoScheduleCycles } from "@/plane-web/components/cycles/settings";
// plane web imports
import { PROJECT_BASE_FEATURES_LIST } from "@/plane-web/constants/project/settings";
import type { Route } from "./+types/page";

function CyclesFeatureSettingsPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, projectId } = params;
  // permissions
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const canPerformProjectAdminActions = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.PROJECT);
  // project store
  const { getProjectById, updateProject } = useProject();
  const currentProjectDetails = getProjectById(projectId);

  if (workspaceUserInfo && !canPerformProjectAdminActions) {
    return <NotAuthorizedView section="settings" isProjectView className="h-auto" />;
  }

  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Cycle Configuration` : undefined;

  const handleToggle = async () => {
    if (!currentProjectDetails) return;
    const payload = { cycle_view: !currentProjectDetails.cycle_view };
    const promise = updateProject(workspaceSlug, projectId, payload);
    setPromiseToast(promise, {
      loading: "Updating project feature...",
      success: { title: "Success!", message: () => "Project feature updated successfully." },
      error: { title: "Error!", message: () => "Something went wrong. Please try again." },
    });
  };

  const cyclesIcon = PROJECT_BASE_FEATURES_LIST.cycles.icon;

  return (
    <SettingsContentWrapper>
      <PageHead title={pageTitle} />
      <div className="mb-4">
        <Link
          href={`/${workspaceSlug}/settings/projects/${projectId}/features`}
          className="text-13 text-tertiary hover:text-secondary"
        >
          <div className="flex items-center gap-2">
            <ChevronLeftIcon className="h-4 w-4 text-tertiary" />
            <span className="text-13 text-tertiary font-bold">Back to features</span>
          </div>
        </Link>
      </div>

      <SettingsHeading
        title="Cycles"
        description="Schedule work in flexible periods that adapt to this project's unique rhythm and pace."
      />

      <div className="gap-x-8 gap-y-2 border-b border-subtle bg-surface-1 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center rounded-sm bg-layer-1 p-3">{cyclesIcon}</div>
            <div>
              <h4 className="text-13 font-medium leading-5">Enable cycles</h4>
              <p className="text-13 leading-5 tracking-tight text-tertiary">Plan work in focused timeframes.</p>
            </div>
          </div>

          <ToggleSwitch
            value={!!currentProjectDetails?.cycle_view}
            onChange={handleToggle}
            disabled={!canPerformProjectAdminActions}
            size="sm"
          />
        </div>
      </div>

      {/* Auto-schedule cycles configuration */}
      {currentProjectDetails?.cycle_view && <AutoScheduleCycles />}
    </SettingsContentWrapper>
  );
}

export default observer(CyclesFeatureSettingsPage);
