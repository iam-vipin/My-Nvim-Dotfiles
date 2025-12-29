import { ArchiveRestoreIcon } from "lucide-react";
import { EditIcon, NewTabIcon, LinkIcon, GlobeIcon, LockIcon, ArchiveIcon, TrashIcon } from "@plane/propel/icons";
import { useTranslation } from "@plane/i18n";
import type { TContextMenuItem } from "@plane/ui";

/**
 * Unified factory for creating menu items across all entities (cycles, modules, views, epics)
 */
export const useQuickActionsFactory = () => {
  const { t } = useTranslation();

  return {
    // Common menu items
    createEditMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "edit",
      title: t("edit"),
      icon: EditIcon,
      action: handler,
      shouldRender,
    }),

    createOpenInNewTabMenuItem: (handler: () => void): TContextMenuItem => ({
      key: "open-new-tab",
      title: t("open_in_new_tab"),
      icon: NewTabIcon,
      action: handler,
    }),

    createCopyLinkMenuItem: (handler: () => void): TContextMenuItem => ({
      key: "copy-link",
      title: t("copy_link"),
      icon: LinkIcon,
      action: handler,
    }),

    createArchiveMenuItem: (
      handler: () => void,
      opts: { shouldRender?: boolean; disabled?: boolean; description?: string }
    ): TContextMenuItem => ({
      key: "archive",
      title: t("archive"),
      icon: ArchiveIcon,
      action: handler,
      className: "items-start",
      iconClassName: "mt-1",
      description: opts.description,
      disabled: opts.disabled,
      shouldRender: opts.shouldRender,
    }),

    createRestoreMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "restore",
      title: t("restore"),
      icon: ArchiveRestoreIcon,
      action: handler,
      shouldRender,
    }),

    createDeleteMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "delete",
      title: t("delete"),
      icon: TrashIcon,
      action: handler,
      shouldRender,
    }),

    // Layout-level actions (for work item list views)
    createOpenInNewTab: (handler: () => void): TContextMenuItem => ({
      key: "open-in-new-tab",
      title: "Open in new tab",
      icon: NewTabIcon,
      action: handler,
    }),

    createCopyLayoutLinkMenuItem: (handler: () => void): TContextMenuItem => ({
      key: "copy-link",
      title: "Copy link",
      icon: LinkIcon,
      action: handler,
    }),

    // Comment menu items
    createCommentEditMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "edit",
      title: t("common.actions.edit"),
      icon: EditIcon,
      action: handler,
      shouldRender,
    }),

    createCommentCopyLinkMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "copy_link",
      title: t("common.actions.copy_link"),
      icon: LinkIcon,
      action: handler,
      shouldRender,
    }),

    createCommentAccessSpecifierMenuItem: (
      handler: () => void,
      isInternal: boolean,
      shouldRender: boolean = true
    ): TContextMenuItem => ({
      key: "access_specifier",
      title: isInternal ? t("issue.comments.switch.public") : t("issue.comments.switch.private"),
      icon: isInternal ? GlobeIcon : LockIcon,
      action: handler,
      shouldRender,
    }),

    createCommentDeleteMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "delete",
      title: t("common.actions.delete"),
      icon: TrashIcon,
      action: handler,
      shouldRender,
    }),
  };
};
