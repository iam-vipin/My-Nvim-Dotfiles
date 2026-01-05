import { useCallback } from "react";
import { PanelLeft } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { LinkIcon, PiIcon, SearchIcon } from "@plane/propel/icons";
// plane imports
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { copyTextToClipboard } from "@plane/utils";
// components
import type { TPowerKCommandConfig } from "@/components/power-k/core/types";
// hooks
import { useAppTheme } from "@/hooks/store/use-app-theme";
import { usePowerK } from "@/hooks/store/use-power-k";
import { isPiAllowed } from "@/plane-web/helpers/pi-chat.helper";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import { usePathname } from "next/navigation";

export const usePowerKMiscellaneousCommands = (): TPowerKCommandConfig[] => {
  // store hooks
  const { toggleSidebar } = useAppTheme();
  const { topNavInputRef, topNavSearchInputRef } = usePowerK();
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  const { togglePiChatDrawer } = usePiChat();
  const pathname = usePathname();
  // translation
  const { t } = useTranslation();

  const copyCurrentPageUrlToClipboard = useCallback(() => {
    const url = new URL(window.location.href);
    copyTextToClipboard(url.href)
      .then(() => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("power_k.miscellaneous_actions.copy_current_page_url_toast_success"),
        });
      })
      .catch(() => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("power_k.miscellaneous_actions.copy_current_page_url_toast_error"),
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusTopNavSearch = useCallback(() => {
    // Focus PowerK input if available, otherwise focus regular search input
    if (topNavSearchInputRef?.current) {
      topNavSearchInputRef.current.focus();
    } else if (topNavInputRef?.current) {
      topNavInputRef.current.focus();
    }
  }, [topNavInputRef, topNavSearchInputRef]);

  return [
    {
      id: "toggle_app_sidebar",
      group: "miscellaneous",
      type: "action",
      i18n_title: "power_k.miscellaneous_actions.toggle_app_sidebar",
      icon: PanelLeft,
      action: () => toggleSidebar(),
      modifierShortcut: "cmd+b",
      isEnabled: () => true,
      isVisible: () => true,
      closeOnSelect: true,
    },
    {
      id: "copy_current_page_url",
      group: "miscellaneous",
      type: "action",
      i18n_title: "power_k.miscellaneous_actions.copy_current_page_url",
      icon: LinkIcon,
      action: copyCurrentPageUrlToClipboard,
      modifierShortcut: "cmd+shift+c",
      isEnabled: () => true,
      isVisible: () => true,
      closeOnSelect: true,
    },
    {
      id: "focus_top_nav_search",
      group: "miscellaneous",
      type: "action",
      i18n_title: "power_k.miscellaneous_actions.focus_top_nav_search",
      icon: SearchIcon,
      action: focusTopNavSearch,
      modifierShortcut: "cmd+f",
      isEnabled: () => true,
      isVisible: () => true,
      closeOnSelect: true,
    },
    {
      id: "open_ai_assistant",
      type: "action",
      group: "miscellaneous",
      i18n_title: "power_k.miscellaneous_actions.open_ai_assistant",
      icon: PiIcon,
      modifierShortcut: "cmd+a",
      action: () => togglePiChatDrawer(),
      isEnabled: (ctx) =>
        isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED) &&
        Boolean(ctx.params.projectId?.toString() || ctx.params.workItem?.toString()) &&
        isPiAllowed(pathname, ctx.params.workspaceSlug?.toString() ?? ""),
      isVisible: (ctx) =>
        isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED) &&
        Boolean(ctx.params.projectId?.toString() || ctx.params.workItem?.toString()) &&
        isPiAllowed(pathname, ctx.params.workspaceSlug?.toString() ?? ""),
      closeOnSelect: true,
    },
  ];
};
