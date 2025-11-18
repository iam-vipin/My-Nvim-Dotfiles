import { useCallback, useRef } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// Plane
import { EUserPermissionsLevel } from "@plane/constants";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { InitiativeIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import { EUserWorkspaceRoles } from "@plane/types";
import { cn } from "@plane/utils";
// components
// hooks
import { useAppTheme } from "@/hooks/store/use-app-theme";
import { useUserPermissions } from "@/hooks/store/user";
import { usePlatformOS } from "@/hooks/use-platform-os";
// plane web
import { UpdateStatusPills } from "@/plane-web/components/initiatives/common/update-status";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
// local components
import { useInitiativeUpdates } from "../details/sidebar/use-updates";
import { InitiativesBlockProperties } from "./initiatives-block-properties";
import { InitiativeQuickActions } from "./quick-actions";

type Props = {
  initiativeId: string;
};

export const InitiativeKanbanCard = observer((props: Props) => {
  const { initiativeId } = props;
  const parentRef = useRef<HTMLDivElement>(null);
  const { workspaceSlug } = useParams();

  const {
    initiative: { getInitiativeById, getInitiativeStatsById, setPeekInitiative },
  } = useInitiatives();

  const { sidebarCollapsed: isSidebarCollapsed } = useAppTheme();
  const { isMobile } = usePlatformOS();
  const { allowPermissions } = useUserPermissions();
  const { handleUpdateOperations } = useInitiativeUpdates(workspaceSlug.toString(), initiativeId);

  const initiative = getInitiativeById(initiativeId);
  const initiativeStats = getInitiativeStatsById(initiativeId);

  if (!initiative) return null;

  const isEditable = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  const handleInitiativeClick = useCallback(
    (e: React.MouseEvent) => {
      // If command/ctrl + click, open in new tab
      if (e.metaKey || e.ctrlKey) {
        const url = `/${workspaceSlug}/initiatives/${initiativeId}`;
        window.open(url, "_blank");
        return;
      }
      // Otherwise open peek view
      setPeekInitiative({ workspaceSlug: workspaceSlug.toString(), initiativeId });
    },
    [workspaceSlug, initiativeId, setPeekInitiative]
  );

  return (
    <div
      ref={parentRef}
      className={cn(
        "group/initiative-card relative flex flex-col gap-3 rounded-md border border-custom-border-200 bg-custom-background-100 p-3 text-sm transition-colors"
      )}
      onClick={handleInitiativeClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex items-center flex-shrink-0 bg-custom-background-90 rounded-md p-2">
            {initiative?.logo_props?.in_use ? (
              <Logo logo={initiative?.logo_props} size={16} type="lucide" />
            ) : (
              <InitiativeIcon className="h-4 w-4 text-custom-text-300" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <Tooltip tooltipContent={initiative.name} position="top" isMobile={isMobile}>
              <span className="truncate text-sm font-medium text-custom-text-100 block">{initiative.name}</span>
            </Tooltip>
          </div>
        </div>
        <div className="flex-shrink-0 bg-custom-background-90 rounded-md">
          <InitiativeQuickActions
            parentRef={parentRef}
            initiative={initiative}
            workspaceSlug={workspaceSlug.toString()}
            disabled={!isEditable}
          />
        </div>
      </div>

      {/* Update Status */}
      {initiativeStats && (
        <UpdateStatusPills
          handleUpdateOperations={handleUpdateOperations}
          workspaceSlug={workspaceSlug.toString()}
          initiativeId={initiativeId}
          analytics={initiativeStats}
          showTabs={false}
        />
      )}

      {/* Properties */}
      <InitiativesBlockProperties
        initiative={initiative}
        isSidebarCollapsed={isSidebarCollapsed}
        workspaceSlug={workspaceSlug.toString()}
      />
    </div>
  );
});
