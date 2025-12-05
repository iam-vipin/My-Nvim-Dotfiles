"use client";

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
import type { Route } from "./+types/layout";

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

  return (
    <SettingsContentWrapper>
      <Outlet />
    </SettingsContentWrapper>
  );
}

export default observer(RecurringWorkItemsProjectSettingsLayout);
