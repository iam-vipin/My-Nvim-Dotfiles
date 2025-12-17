import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { EUserPermissionsLevel, TEAMSPACE_TRACKER_ELEMENTS } from "@plane/constants";
import { Button } from "@plane/propel/button";
import { TeamsIcon } from "@plane/propel/icons";
import { EUserWorkspaceRoles } from "@plane/types";
import { Breadcrumbs } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
// hooks
import { captureClick } from "@/helpers/event-tracker.helper";
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";
// helpers
// plane web components
import { TeamspacesListSearch } from "@/plane-web/components/teamspaces/headers/list-header/search-teamspaces";

export const TeamspaceListItemHeader = observer(function TeamspaceListItemHeader() {
  const { workspaceSlug } = useParams();
  // hooks
  const { currentWorkspace } = useWorkspace();
  const { toggleCreateTeamspaceModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const workspaceId = currentWorkspace?.id || undefined;
  const hasAdminLevelPermissions = allowPermissions([EUserWorkspaceRoles.ADMIN], EUserPermissionsLevel.WORKSPACE);

  if (!workspaceSlug || !workspaceId) return <></>;

  return (
    <div className="flex-shrink-0 relative z-10 flex h-header w-full">
      <div className="w-full h-full relative flex justify-between items-center gap-x-2 gap-y-4">
        <div className="flex items-center gap-4">
          {/* bread crumps */}
          <Breadcrumbs>
            <Breadcrumbs.Item
              component={<BreadcrumbLink label="Teamspaces" icon={<TeamsIcon className="h-4 w-4 text-tertiary" />} />}
            />
          </Breadcrumbs>
          {/* Only workspace admins can see and join teamspaces created by other admins. */}
          {/* {hasAdminLevelPermissions && <TeamspaceScopeDropdown />} */}
        </div>
        <div className="flex items-center gap-2">
          {/* search */}
          <TeamspacesListSearch />
          {/* filters dropdown */}
          {/* <div className="flex items-center gap-4">
            <TeamListFiltersDropdown />
          </div> */}
          {/* create teamspace button */}
          {hasAdminLevelPermissions && (
            <Button
              onClick={() => {
                captureClick({
                  elementName: TEAMSPACE_TRACKER_ELEMENTS.LIST_HEADER_ADD_BUTTON,
                });
                toggleCreateTeamspaceModal({ isOpen: true, teamspaceId: undefined });
              }}
              className="items-center gap-1"
              size="lg"
            >
              <span className="hidden sm:inline-block">Add</span> Teamspace
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
