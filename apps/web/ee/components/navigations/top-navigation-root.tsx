import { useMemo } from "react";
import { isDesktopApp as isDesktopAppFn } from "@todesktop/client-core/platform/todesktop";
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
import { useAppRailVisibility } from "@/lib/app-rail/context";
import { useFlag, useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import { DesktopHeaderProvider } from "../desktop/root";
import { WorkspaceAppSwitcher } from "../workspace/app-switcher";
import { TopNavSearch } from "./top-nav-search";
import { isPiAllowed } from "@/plane-web/helpers/pi-chat.helper";

export const TopNavigationRoot = observer(function TopNavigationRoot() {
  // store hooks
  const { config } = useInstance();
  const { togglePiChatDrawer, isPiChatDrawerOpen } = usePiChat();
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  const { unreadNotificationsCount, getUnreadNotificationsCount } = useWorkspaceNotifications();
  const { preferences } = useAppRailPreferences();
  const { isEnabled: isAppRailEnabled, isCollapsed: isAppRailCollapsed } = useAppRailVisibility();
  // router
  const { workspaceSlug, projectId, workItem } = useParams();
  const pathname = usePathname();
  // derived
  const isDesktopApp = useMemo(() => isDesktopAppFn(), []);

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
    isPiAllowed(pathname, workspaceSlug?.toString() ?? "") &&
    isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED) &&
    (projectId || workItem);

  const isAdvancedSearchEnabled = useFlag(workspaceSlug?.toString(), "ADVANCED_SEARCH");
  const isOpenSearch = config?.is_opensearch_enabled;
  const showLabel = preferences.displayMode === "icon_with_label";

  // Show WorkspaceAppSwitcher when app rail is enabled and collapsed
  const shouldShowAppSwitcher = isAppRailEnabled && isAppRailCollapsed;

  return (
    <div
      className={cn("desktop-header flex items-center min-h-11 w-full px-3.5 z-[27] transition-all duration-300", {
        "px-2": !showLabel,
      })}
    >
      <div className="flex flex-1 shrink-0 items-center gap-1.5">
        {shouldShowAppSwitcher && <WorkspaceAppSwitcher />}
        {/* Workspace Menu */}
        <div className="shrink-0 flex-1">
          {!isDesktopApp && <WorkspaceMenuRoot variant="top-navigation" />}
          {isDesktopApp && <DesktopHeaderProvider />}
        </div>
      </div>
      {/* Power K Search */}
      <div className="desktop-header-actions shrink-0">
        {isAdvancedSearchEnabled && isOpenSearch ? <TopNavSearch /> : <TopNavPowerK />}
      </div>
      {/* Additional Actions */}
      <div className="desktop-header-actions shrink-0 flex-1 flex items-center gap-1 justify-end">
        <Tooltip tooltipContent="Inbox" position="bottom">
          <AppSidebarItem
            variant="link"
            item={{
              href: `/${workspaceSlug?.toString()}/notifications/`,
              icon: (
                <div className="relative">
                  <InboxIcon className="size-5" />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-0 -right-0 size-2 rounded-full bg-red-500" />
                  )}
                </div>
              ),
              isActive: pathname?.includes("/notifications/"),
            }}
          />
        </Tooltip>
        <HelpMenuRoot />
        {shouldRenderPiChat && (
          <div>
            <Tooltip tooltipContent="Ask AI" position="bottom">
              <button
                className={cn(
                  "flex items-center gap-1.5 transition-colors h-8 py-1.5 px-1 rounded-md  hover:bg-layer-1 text-tertiary hover:text-secondary place-items-center w-full",
                  {
                    "bg-accent-primary/10 !text-accent-secondary": isPiChatDrawerOpen,
                  }
                )}
                onClick={() => togglePiChatDrawer()}
                data-prevent-outside-click
              >
                <span className="shrink-0 size-5 grid place-items-center">
                  {isPiChatDrawerOpen ? <CloseIcon className="size-5" /> : <PiIcon className="size-5" />}
                </span>
                <span className="text-13 leading-normal font-medium pr-1">AI assistant</span>
              </button>
            </Tooltip>
          </div>
        )}
        <UserMenuRoot size="xs" />
      </div>
    </div>
  );
});
