"use client";

import { observer } from "mobx-react";
// plane imports
import Link from "next/link";
import { useParams } from "next/navigation";
import { Outlet } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
import { EUserPermissionsLevel } from "@plane/constants";
import { EUserProjectRoles } from "@plane/types";
// components
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
// hooks
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { useUserPermissions } from "@/hooks/store/user";

const ProjectLevelTemplatesLayout = observer(() => {
  // router params
  const { workspaceSlug, projectId } = useParams();
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
          href={`/${workspaceSlug}/settings/projects/${projectId}/templates`}
          className="flex items-center gap-2 text-sm font-semibold text-custom-text-300 mb-6"
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
});

export default ProjectLevelTemplatesLayout;
