import type { FC } from "react";
import { observer } from "mobx-react";
// plane imports
import { EUserPermissionsLevel, PROJECT_TRACKER_ELEMENTS } from "@plane/constants";
import { Button } from "@plane/propel/button";
import { EUserWorkspaceRoles } from "@plane/types";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useUserPermissions } from "@/hooks/store/user";

export const ProjectCreateButton = observer(function ProjectCreateButton() {
  // hooks
  const { toggleCreateProjectModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();

  const isAuthorizedUser = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  if (!isAuthorizedUser) return <></>;
  return (
    <Button
      data-ph-element={PROJECT_TRACKER_ELEMENTS.CREATE_HEADER_BUTTON}
      onClick={() => {
        toggleCreateProjectModal(true);
      }}
      className="items-center gap-1"
    >
      <span className="hidden sm:inline-block">Add</span> Project
    </Button>
  );
});
