import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import useSWR from "swr";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
import { CloseIcon, InboxIcon, PiIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import { cn } from "@plane/utils";
// components
import { TopNavPowerK } from "@/components/navigation";
import { AppSidebarItem } from "@/components/sidebar/sidebar-item";
import { HelpMenuRoot } from "@/components/workspace/sidebar/help-section/root";
import { UserMenuRoot } from "@/components/workspace/sidebar/user-menu-root";
import { WorkspaceMenuRoot } from "@/components/workspace/sidebar/workspace-menu-root";
// hooks
import { useWorkspaceNotifications } from "@/hooks/store/notifications";
import { useInstance } from "@/hooks/store/use-instance";
// plane web imports
import { useAppRailPreferences } from "@/hooks/use-navigation-preferences";
import { useFlag, useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import { TopNavSearch } from "./top-nav-search";

export const TopNavigationRoot = observer(() => {
  // store hooks
  const { config } = useInstance();
  const { togglePiChatDrawer, isPiChatDrawerOpen } = usePiChat();
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  const { unreadNotificationsCount, getUnreadNotificationsCount } = useWorkspaceNotifications();
  const { preferences } = useAppRailPreferences();

  // router
  const { workspaceSlug } = useParams();
  const pathname = usePathname();

  // Fetch notification count
  useSWR(
    workspaceSlug ? "WORKSPACE_UNREAD_NOTIFICATION_COUNT" : null,
    workspaceSlug ? () => getUnreadNotificationsCount(workspaceSlug.toString()) : null
  );

  // Calculate notification count
  const isMentionsEnabled = unreadNotificationsCount.mention_unread_notifications_count > 0;
  const totalNotifications = isMentionsEnabled
    ? unreadNotificationsCount.mention_unread_notifications_count
    : unreadNotificationsCount.total_unread_notifications_count;

  const shouldRenderPiChat =
    useFlag(workspaceSlug?.toString() ?? "", E_FEATURE_FLAGS.PI_CHAT) &&
    !pathname.includes(`/${workspaceSlug?.toString()}/pi-chat/`) &&
    isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED);

  const isAdvancedSearchEnabled = useFlag(workspaceSlug?.toString(), "ADVANCED_SEARCH");
  const isOpenSearch = config?.is_opensearch_enabled;
  const showLabel = preferences.displayMode === "icon_with_label";

  return (
    <div
      className={cn("flex items-center justify-evenly min-h-11 w-full px-3.5 z-[27] transition-all duration-300", {
        "px-3.5": showLabel,
        "px-2": !showLabel,
      })}
    >
      {/* Workspace Menu */}
      <div className="flex items-center justify-start flex-shrink-0">
        <WorkspaceMenuRoot />
      </div>
      {/* Power K Search */}
      <div className="flex items-center justify-center flex-grow px-4">
        {isAdvancedSearchEnabled && isOpenSearch ? <TopNavSearch /> : <TopNavPowerK />}
      </div>
      {/* Additional Actions */}
      <div className="flex gap-1.5 items-center justify-end flex-shrink-0 min-w-60">
        <Tooltip tooltipContent="Inbox" position="bottom">
          <AppSidebarItem
            variant="link"
            item={{
              href: `/${workspaceSlug?.toString()}/notifications/`,
              icon: (
                <div className="relative">
                  <InboxIcon className="size-4" />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-0 -right-0 size-2 rounded-full bg-red-500" />
                  )}
                </div>
              ),
              isActive: pathname?.includes("/notifications/"),
            }}
          />
        </Tooltip>

        {shouldRenderPiChat && (
          <div>
            <Tooltip tooltipContent="Ask AI" position="bottom">
              <button
                className={cn(
                  "flex items-center gap-2 transition-colors p-2 rounded-md  hover:bg-custom-background-80 text-custom-text-300 hover:text-custom-text-200  text-custom-text-200 place-items-center w-full",
                  {
                    "bg-custom-primary-100/10 !text-custom-primary-200 gap-1": isPiChatDrawerOpen,
                  }
                )}
                onClick={() => togglePiChatDrawer()}
              >
                {isPiChatDrawerOpen ? <CloseIcon className="size-4" /> : <PiIcon className="size-4" />}
                <span className="text-xs leading-normal font-medium">AI assistant</span>
              </button>
            </Tooltip>
          </div>
        )}
        <HelpMenuRoot />
        <UserMenuRoot size="xs" />
      </div>
    </div>
  );
});
