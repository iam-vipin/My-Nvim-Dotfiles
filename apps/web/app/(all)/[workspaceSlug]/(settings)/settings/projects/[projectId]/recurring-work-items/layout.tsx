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
import { Outlet } from "react-router";
import useSWR from "swr";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { EUserProjectRoles } from "@plane/types";
// components
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
// store hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
// plane web components
import { useRecurringWorkItems } from "@/plane-web/hooks/store/recurring-work-items/use-recurring-work-items";
import { useFlag } from "@/plane-web/hooks/store/use-flag";
// local imports
import type { Route } from "./+types/layout";
import { RecurringWorkItemsProjectSettingsHeader } from "./header";

function RecurringWorkItemsProjectSettingsLayout({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, projectId } = params;
  // store hooks
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const { getProjectById } = useProject();
  const { fetchRecurringWorkItems } = useRecurringWorkItems();
  // derived values
  const isRecurringWorkItemsEnabled = useFlag(workspaceSlug, "RECURRING_WORKITEMS");
  const currentProjectDetails = getProjectById(projectId);
  const hasMemberLevelPermission = allowPermissions(
    [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  // fetching recurring work items
  useSWR(
    isRecurringWorkItemsEnabled ? ["recurringWorkItems", workspaceSlug, projectId, isRecurringWorkItemsEnabled] : null,
    isRecurringWorkItemsEnabled ? () => fetchRecurringWorkItems(workspaceSlug, projectId) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  if (!currentProjectDetails?.id) return <></>;

  if (workspaceUserInfo && !hasMemberLevelPermission) {
    return <NotAuthorizedView section="settings" isProjectView />;
  }

  return <Outlet />;
}

export default observer(RecurringWorkItemsProjectSettingsLayout);
