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
import { ChevronLeft } from "lucide-react";
// plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
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
// plane web imports
import { IntakeFeatureChildren } from "@/plane-web/components/projects/settings/intake/feature-children";
import { PROJECT_BASE_FEATURES_LIST } from "@/plane-web/constants/project/settings";
import type { Route } from "./+types/page";
import { SettingsBoxedControlItem } from "@/components/settings/boxed-control-item";

const IntakeFeatureSettingsPage = observer(function IntakeFeatureSettingsPage(props: Route.ComponentProps) {
  const { workspaceSlug, projectId } = props.params;
  // permissions
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const canPerformProjectAdminActions = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.PROJECT);
  // project store
  const { getProjectById, updateProject } = useProject();
  const currentProjectDetails = projectId ? getProjectById(projectId) : undefined;

  if (!currentProjectDetails) return null;

  if (workspaceUserInfo && !canPerformProjectAdminActions) {
    return <NotAuthorizedView section="settings" isProjectView className="h-auto" />;
  }

  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Intake Configuration` : undefined;

  const handleToggle = async () => {
    if (!currentProjectDetails) return;
    const payload = { inbox_view: !currentProjectDetails.inbox_view };
    const promise = updateProject(workspaceSlug, projectId, payload);
    setPromiseToast(promise, {
      loading: "Updating project feature...",
      success: { title: "Success!", message: () => "Project feature updated successfully." },
      error: { title: "Error!", message: () => "Something went wrong. Please try again." },
    });
  };

  const featureIcon = PROJECT_BASE_FEATURES_LIST.inbox.icon;

  return (
    <SettingsContentWrapper>
      <PageHead title={pageTitle} />
      <div className="mb-4">
        <Link
          href={`/${workspaceSlug}/settings/projects/${projectId}/features`}
          className="text-13 text-tertiary hover:text-secondary"
        >
          <div className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4 text-tertiary" />
            <span className="text-13 text-tertiary font-bold">Back to features</span>
          </div>
        </Link>
      </div>

      <SettingsHeading
        title="Intake"
        description="Approve or discard suggested work items from your customers, users, or other stakeholders."
      />
      <div className="mt-6">
        <SettingsBoxedControlItem
          title="Enable intake for this project"
          description="Consider and discuss issues before you add them to your project."
          control={
            <ToggleSwitch
              value={Boolean(currentProjectDetails?.inbox_view)}
              onChange={handleToggle}
              disabled={!canPerformProjectAdminActions}
              size="sm"
            />
          }
        />
      </div>
      {currentProjectDetails.inbox_view && (
        <div className="mt-12">
          <IntakeFeatureChildren currentProjectDetails={currentProjectDetails} workspaceSlug={workspaceSlug} />
        </div>
      )}
    </SettingsContentWrapper>
  );
});

export default IntakeFeatureSettingsPage;
