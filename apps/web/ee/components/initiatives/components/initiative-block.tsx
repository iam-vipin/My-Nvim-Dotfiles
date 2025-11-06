import { useCallback, useRef } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
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
import { useAppRouter } from "@/hooks/use-app-router";
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

export const InitiativeBlock = observer((props: Props) => {
  const { initiativeId } = props;
  // ref
  const parentRef = useRef<HTMLDivElement>(null);
  const { workspaceSlug } = useParams();
  const router = useAppRouter();

  const {
    initiative: { getInitiativeById, getInitiativeStatsById },
  } = useInitiatives();

  const { sidebarCollapsed: isSidebarCollapsed } = useAppTheme();
  const { isMobile } = usePlatformOS();
  const { allowPermissions } = useUserPermissions();
  const { handleUpdateOperations } = useInitiativeUpdates(workspaceSlug.toString(), initiativeId);

  const initiative = getInitiativeById(initiativeId);
  const initiativeStats = getInitiativeStatsById(initiativeId);

  if (!initiative) return <></>;

  const isEditable = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  return (
    <div
      ref={parentRef}
      className={cn(
        "group/initiative-block min-h-[52px] relative flex flex-col items-center justify-between gap-3 py-4 text-sm border-b border-custom-border-200 bg-custom-background-100 hover:bg-custom-background-90 transition-colors px-page-x",
        {
          "lg:flex-row lg:gap-5 lg:py-0": !isSidebarCollapsed,
          "xl:flex-row xl:gap-5 xl:py-0": isSidebarCollapsed,
        }
      )}
      onClick={() => router.push(`/${workspaceSlug}/initiatives/${initiativeId}`)}
    >
      <div className="relative flex w-full items-center justify-between gap-3 truncate flex-wrap md:flex-nowrap flex-shrink-0">
        <div className="flex w-full items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-4 truncate">
            <span className="flex items-center flex-shrink-0">
              {initiative?.logo_props?.in_use ? (
                <Logo logo={initiative?.logo_props} size={16} type="lucide" />
              ) : (
                <InitiativeIcon className="h-4 w-4 text-custom-text-300" />
              )}
            </span>
            <Link href={`/${workspaceSlug}/initiatives/${initiative.id}`} className="w-full truncate cursor-pointer">
              <Tooltip tooltipContent={initiative.name} position="top" isMobile={isMobile}>
                <span className="truncate text-sm">{initiative.name}</span>
              </Tooltip>
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 h-full">
          <UpdateStatusPills
            handleUpdateOperations={handleUpdateOperations}
            workspaceSlug={workspaceSlug.toString()}
            initiativeId={initiativeId}
            analytics={initiativeStats}
            showTabs
          />
          <InitiativesBlockProperties
            initiative={initiative}
            isSidebarCollapsed={isSidebarCollapsed}
            workspaceSlug={workspaceSlug.toString()}
          />
          <div
            className={cn("hidden", {
              "md:flex": isSidebarCollapsed,
              "lg:flex": !isSidebarCollapsed,
            })}
          >
            <InitiativeQuickActions
              parentRef={parentRef}
              initiative={initiative}
              workspaceSlug={workspaceSlug.toString()}
              disabled={!isEditable}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
