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
// components
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { ProjectFeaturesList } from "@/plane-web/components/projects/settings/features-list";
// local imports
import type { Route } from "./+types/page";
import { FeaturesProjectSettingsHeader } from "./header";

function FeaturesSettingsPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, projectId } = params;
  // store
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();

  const { currentProjectDetails } = useProject();
  // derived values
  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Features` : undefined;
  const canPerformProjectAdminActions = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.PROJECT);

  if (workspaceUserInfo && !canPerformProjectAdminActions) {
    return <NotAuthorizedView section="settings" isProjectView className="h-auto" />;
  }

  return (
    <SettingsContentWrapper header={<FeaturesProjectSettingsHeader />}>
      <PageHead title={pageTitle} />
      <section className={`w-full ${canPerformProjectAdminActions ? "" : "opacity-60"}`}>
        <ProjectFeaturesList
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          isAdmin={canPerformProjectAdminActions}
        />
      </section>
    </SettingsContentWrapper>
  );
}

export default observer(FeaturesSettingsPage);
