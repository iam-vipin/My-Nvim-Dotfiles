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
import Link from "next/link";
import { Outlet } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
import { EUserPermissionsLevel } from "@plane/constants";
import { EUserProjectRoles } from "@plane/types";
// components
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
// hooks
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { useUserPermissions } from "@/hooks/store/user";
// local imports
import type { Route } from "./+types/layout";
import { TemplatesProjectSettingsHeader } from "../header";

function ProjectLevelTemplatesLayout({ params }: Route.ComponentProps) {
  // router params
  const { workspaceSlug, projectId } = params;
  // store hooks
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  // derived values
  const hasAdminPermission = allowPermissions([EUserProjectRoles.ADMIN], EUserPermissionsLevel.PROJECT);

  if (workspaceUserInfo && !hasAdminPermission) {
    return <NotAuthorizedView section="settings" isProjectView />;
  }

  return (
    <SettingsContentWrapper header={<TemplatesProjectSettingsHeader />}>
      <div className="w-full h-full">
        <Link
          href={`/${workspaceSlug}/settings/projects/${projectId}/templates`}
          className="flex items-center gap-2 text-13 font-semibold text-tertiary mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <div>Back to templates</div>
        </Link>
        <div className="pb-14">
          <Outlet />
        </div>
      </div>
    </SettingsContentWrapper>
  );
}

export default observer(ProjectLevelTemplatesLayout);
