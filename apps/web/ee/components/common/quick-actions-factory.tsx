import { useState } from "react";
import { StopCircle, Download, Lock, LockOpen, Pencil, Trash2 } from "lucide-react";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { CommentReplyIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EIssuesStoreType } from "@plane/types";
import type { TContextMenuItem } from "@plane/ui";
// components
import { useQuickActionsFactory as useCoreQuickActionsFactory } from "@/components/common/quick-actions-factory";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { useProjectView } from "@/hooks/store/use-project-view";
import { useWorkItemFilters } from "@/hooks/store/work-item-filters/use-work-item-filters";
// plane web imports
import { EndCycleModal } from "@/plane-web/components/cycles/end-cycle";
import { ExportModal } from "@/plane-web/components/issues/issue-layouts/export-modal";
import type { TExportProvider } from "@/plane-web/components/issues/issue-layouts/export-modal";
import { useFlag } from "@/plane-web/hooks/store";
import exportService from "@/plane-web/services/export.service";

type FeatureResult = {
  items: TContextMenuItem[];
  modals: JSX.Element | null;
};

/**
 * EE-specific factory extending the core factory with EE-only menu item creators and features
 */
export const useQuickActionsFactory = () => {
  const coreFactory = useCoreQuickActionsFactory();

  return {
    ...coreFactory,

    // EE-specific menu items
    createEndCycleMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "end-cycle",
      title: "End Cycle",
      icon: StopCircle,
      action: handler,
      shouldRender,
    }),

    createExportMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "export",
      title: "Export",
      icon: Download,
      action: handler,
      shouldRender,
    }),

    createLockMenuItem: (
      handler: () => void,
      opts: { isLocked: boolean; shouldRender?: boolean }
    ): TContextMenuItem => ({
      key: "toggle-lock",
      title: opts.isLocked ? "Unlock" : "Lock",
      icon: opts.isLocked ? LockOpen : Lock,
      action: handler,
      shouldRender: opts.shouldRender,
    }),

    // EE feature: End Cycle with modal
    useCycleEndFeature: (props: {
      workspaceSlug: string;
      projectId: string;
      cycleId: string;
      cycleName: string | undefined;
      isCurrentCycle: boolean;
      transferrableIssuesCount: number;
    }): FeatureResult => {
      const [isOpen, setIsOpen] = useState(false);
      const isEnabled = useFlag(props.workspaceSlug, E_FEATURE_FLAGS.CYCLE_PROGRESS_CHARTS);

      const items =
        isEnabled && props.isCurrentCycle
          ? [
              {
                key: "end-cycle",
                title: "End Cycle",
                icon: StopCircle,
                action: () => setIsOpen(true),
                shouldRender: true,
              } as TContextMenuItem,
            ]
          : [];

      const modals =
        isEnabled && props.isCurrentCycle ? (
          <EndCycleModal
            isOpen={isOpen}
            handleClose={() => setIsOpen(false)}
            cycleId={props.cycleId}
            projectId={props.projectId}
            workspaceSlug={props.workspaceSlug}
            transferrableIssuesCount={props.transferrableIssuesCount}
          />
        ) : null;

      return { items, modals };
    },

    // EE feature: Export for Cycles
    useCycleExportFeature: (props: {
      workspaceSlug: string;
      projectId: string;
      cycleId: string;
      isArchived: boolean;
    }): FeatureResult => {
      const [isOpen, setIsOpen] = useState(false);
      const { getFilter } = useWorkItemFilters();
      const richFilters = getFilter(EIssuesStoreType.CYCLE, props.cycleId)?.getExternalExpression();

      const { issuesFilter: _issuesFilter } = useIssues(EIssuesStoreType.CYCLE);
      const isEnabled = useFlag(props.workspaceSlug, E_FEATURE_FLAGS.ADVANCED_EXPORTS);

      const handleExport = async (provider: TExportProvider) => {
        try {
          await exportService.exportCycleWorkItems(
            props.workspaceSlug,
            props.projectId,
            props.cycleId,
            provider,
            richFilters
          );
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Export started",
            message: "Your export will be ready soon.",
            actionItems: (
              <div className="flex items-center gap-1 text-11 text-secondary">
                <a
                  href={`/${props.workspaceSlug}/settings/exports`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary px-2 py-1 hover:bg-layer-1 font-medium rounded"
                >
                  View Exports
                </a>
              </div>
            ),
          });
          setIsOpen(false);
        } catch (_error) {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: "Failed to export cycle. Please try again.",
          });
        }
      };

      const items =
        isEnabled && !props.isArchived
          ? [
              {
                key: "export",
                title: "Export",
                icon: Download,
                action: () => setIsOpen(true),
                shouldRender: true,
              } as TContextMenuItem,
            ]
          : [];

      const modals = isEnabled ? (
        <ExportModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleExport} />
      ) : null;

      return { items, modals };
    },

    // EE feature: Export for Modules
    useModuleExportFeature: (props: {
      workspaceSlug: string;
      projectId: string;
      moduleId: string;
      isArchived: boolean;
    }): FeatureResult => {
      const [isOpen, setIsOpen] = useState(false);
      const { getFilter } = useWorkItemFilters();
      const richFilters = getFilter(EIssuesStoreType.MODULE, props.moduleId)?.getExternalExpression();
      const isEnabled = useFlag(props.workspaceSlug, E_FEATURE_FLAGS.ADVANCED_EXPORTS);

      const handleExport = async (provider: TExportProvider) => {
        try {
          await exportService.exportModuleWorkItems(
            props.workspaceSlug,
            props.projectId,
            props.moduleId,
            provider,
            richFilters
          );
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Export started",
            message: "Your export will be ready soon.",
            actionItems: (
              <div className="flex items-center gap-1 text-11 text-secondary">
                <a
                  href={`/${props.workspaceSlug}/settings/exports`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary px-2 py-1 hover:bg-layer-1 font-medium rounded"
                >
                  View Exports
                </a>
              </div>
            ),
          });
          setIsOpen(false);
        } catch (_error) {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: "Failed to export module. Please try again.",
          });
        }
      };

      const items =
        isEnabled && !props.isArchived
          ? [
              {
                key: "export",
                title: "Export",
                icon: Download,
                action: () => setIsOpen(true),
                shouldRender: true,
              } as TContextMenuItem,
            ]
          : [];

      const modals = isEnabled ? (
        <ExportModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleExport} />
      ) : null;

      return { items, modals };
    },

    // EE feature: View Lock
    useViewLockFeature: (props: {
      workspaceSlug: string;
      projectId?: string;
      viewId: string;
      isLocked: boolean;
      isOwner: boolean;
    }): FeatureResult => {
      const { lockView, unLockView } = useProjectView();
      const isEnabled = useFlag(props.workspaceSlug, E_FEATURE_FLAGS.VIEW_LOCK);

      const handleToggleLock = async () => {
        if (!props.projectId) return;
        const operation = props.isLocked ? unLockView : lockView;
        await operation(props.workspaceSlug, props.projectId, props.viewId)
          .then(() => {
            setToast({
              type: TOAST_TYPE.SUCCESS,
              title: "Success!",
              message: props.isLocked ? "View unlocked successfully." : "View locked successfully.",
            });
          })
          .catch(() => {
            setToast({
              type: TOAST_TYPE.ERROR,
              title: "Error!",
              message: props.isLocked
                ? "View could not be unlocked. Please try again later."
                : "View could not be locked. Please try again later.",
            });
          });
      };

      const items =
        isEnabled && props.isOwner
          ? [
              {
                key: "toggle-lock",
                title: props.isLocked ? "Unlock" : "Lock",
                icon: props.isLocked ? LockOpen : Lock,
                action: handleToggleLock,
                shouldRender: true,
              } as TContextMenuItem,
            ]
          : [];

      return { items, modals: null };
    },

    // EE feature: Export for Views
    useViewExportFeature: (props: { workspaceSlug: string; projectId?: string; viewId: string }): FeatureResult => {
      const [isOpen, setIsOpen] = useState(false);
      const { getFilter } = useWorkItemFilters();
      const richFilterEntityType = props.projectId ? EIssuesStoreType.PROJECT_VIEW : EIssuesStoreType.GLOBAL;
      const richFilters = getFilter(richFilterEntityType, props.viewId)?.getExternalExpression();
      const isEnabled = useFlag(props.workspaceSlug, E_FEATURE_FLAGS.ADVANCED_EXPORTS);

      const handleExport = async (provider: TExportProvider) => {
        try {
          if (props.projectId) {
            await exportService.exportProjectViewWorkItems(
              props.workspaceSlug,
              props.projectId,
              props.viewId,
              provider,
              richFilters
            );
          } else {
            await exportService.exportWorkspaceViewWorkItems(props.workspaceSlug, props.viewId, provider, richFilters);
          }
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Export started",
            message: "Your export will be ready soon.",
            actionItems: (
              <div className="flex items-center gap-1 text-11 text-secondary">
                <a
                  href={`/${props.workspaceSlug}/settings/exports`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary px-2 py-1 hover:bg-layer-1 font-medium rounded"
                >
                  View Exports
                </a>
              </div>
            ),
          });
          setIsOpen(false);
        } catch (_error) {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: "Failed to export view. Please try again.",
          });
        }
      };

      const items = isEnabled
        ? [
            {
              key: "export",
              title: "Export",
              icon: Download,
              action: () => setIsOpen(true),
              shouldRender: true,
            } as TContextMenuItem,
          ]
        : [];

      const modals = isEnabled ? (
        <ExportModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleExport} />
      ) : null;

      return { items, modals };
    },

    // EE feature: Export for Layouts
    useLayoutExportFeature: (props: {
      workspaceSlug: string;
      projectId: string;
      storeType: "PROJECT" | "EPIC";
    }): FeatureResult => {
      const [isOpen, setIsOpen] = useState(false);
      const { getFilter } = useWorkItemFilters();
      const richFilterEntityType = props.storeType === "EPIC" ? EIssuesStoreType.EPIC : EIssuesStoreType.PROJECT;
      const richFilters = getFilter(richFilterEntityType, props.projectId)?.getExternalExpression();
      const isEnabled = useFlag(props.workspaceSlug, E_FEATURE_FLAGS.ADVANCED_EXPORTS);

      const handleExport = async (provider: TExportProvider) => {
        try {
          if (props.storeType === "EPIC") {
            await exportService.exportEpics(props.workspaceSlug, props.projectId, provider, richFilters);
          } else {
            await exportService.exportWorkItems(props.workspaceSlug, props.projectId, provider, richFilters);
          }
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Export started",
            message: "Your export will be ready soon.",
            actionItems: (
              <div className="flex items-center gap-1 text-11 text-secondary">
                <a
                  href={`/${props.workspaceSlug}/settings/exports`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary px-2 py-1 hover:bg-layer-1 font-medium rounded"
                >
                  View Exports
                </a>
              </div>
            ),
          });
          setIsOpen(false);
        } catch (_error) {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: `Failed to export ${props.storeType === "EPIC" ? "epics" : "work items"}. Please try again.`,
          });
        }
      };

      const items = isEnabled
        ? [
            {
              key: "export",
              title: "Export",
              icon: Download,
              action: () => setIsOpen(true),
              shouldRender: true,
            } as TContextMenuItem,
          ]
        : [];

      const modals = isEnabled ? (
        <ExportModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleExport} />
      ) : null;

      return { items, modals };
    },

    // EE feature: Export for Intake
    useIntakeExportFeature: (props: { workspaceSlug: string; projectId: string }): FeatureResult => {
      const [isOpen, setIsOpen] = useState(false);
      const isEnabled = useFlag(props.workspaceSlug, E_FEATURE_FLAGS.ADVANCED_EXPORTS);

      const handleExport = async (provider: TExportProvider) => {
        try {
          await exportService.exportIntakeWorkItems(props.workspaceSlug, props.projectId, provider);
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: "Export started",
            message: "Your export will be ready soon.",
            actionItems: (
              <div className="flex items-center gap-1 text-11 text-secondary">
                <a
                  href={`/${props.workspaceSlug}/settings/exports`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary px-2 py-1 hover:bg-layer-1 font-medium rounded"
                >
                  View Exports
                </a>
              </div>
            ),
          });
          setIsOpen(false);
        } catch (_error) {
          setToast({
            type: TOAST_TYPE.ERROR,
            title: "Error!",
            message: "Failed to export intake. Please try again.",
          });
        }
      };

      const items = isEnabled
        ? [
            {
              key: "export",
              title: "Export",
              icon: Download,
              action: () => setIsOpen(true),
              shouldRender: true,
            } as TContextMenuItem,
          ]
        : [];

      const modals = isEnabled ? (
        <ExportModal isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={handleExport} />
      ) : null;

      return { items, modals };
    },

    // Reply menu items (EE-only)
    createReplyEditMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "edit",
      title: coreFactory.createCommentEditMenuItem(handler, shouldRender).title,
      icon: Pencil,
      action: handler,
      shouldRender,
    }),

    createReplyDeleteMenuItem: (handler: () => void, shouldRender: boolean = true): TContextMenuItem => ({
      key: "delete",
      title: coreFactory.createCommentDeleteMenuItem(handler, shouldRender).title,
      icon: Trash2,
      action: handler,
      shouldRender,
    }),

    // EE feature: Comment Reply
    useCommentReplyFeature: (props: {
      commentId: string;
      handleReply?: () => void;
      shouldRender: boolean;
    }): FeatureResult => {
      const { t } = useTranslation();

      const items = [
        {
          key: "reply",
          title: t("common.actions.reply"),
          icon: CommentReplyIcon,
          action: props.handleReply || (() => {}),
          shouldRender: props.shouldRender,
        } as TContextMenuItem,
      ];

      return { items, modals: null };
    },
  };
};
