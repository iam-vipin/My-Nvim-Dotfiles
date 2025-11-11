"use client";

import { observer } from "mobx-react";
import Link from "next/link";
import { Outlet } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { EUserProjectRoles } from "@plane/types";
import { getRecurringWorkItemSettingsPath } from "@plane/utils";
// components
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
// hooks
import { useUserPermissions } from "@/hooks/store/user";
import type { Route } from "./+types/layout";

function RecurringWorkItemsDetailsLayout({ params }: Route.ComponentProps) {
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
    <SettingsContentWrapper>
      <div className="w-full h-full">
        <Link
          href={getRecurringWorkItemSettingsPath({ workspaceSlug, projectId })}
          className="flex items-center gap-2 text-sm font-semibold text-custom-text-300 mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <div>Back to recurring work items</div>
        </Link>
        <div className="pb-14">
          <Outlet />
        </div>
      </div>
    </SettingsContentWrapper>
  );
}

export default observer(RecurringWorkItemsDetailsLayout);
