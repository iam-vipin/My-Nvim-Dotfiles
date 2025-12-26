// plane imports
import { WORK_ITEM_TRACKER_ELEMENTS_EXTENDED } from "@plane/constants";
import type { ISvgIcons } from "@plane/propel/icons";
import type { TContextMenuItem } from "@plane/ui";
// helpers
import { captureClick } from "@/helpers/event-tracker.helper";
// lib
import { store } from "@/lib/store-context";

export interface CopyMenuHelperProps {
  baseItem: {
    key: string;
    title: string;
    icon: React.FC<ISvgIcons>;
    action: () => void;
    shouldRender: boolean;
  };
  activeLayout: string;
  setCreateUpdateIssueModal: (open: boolean) => void;
  setDuplicateWorkItemModal?: (open: boolean) => void;
  workspaceSlug?: string;
}

export const createCopyMenuWithDuplication = (props: CopyMenuHelperProps): TContextMenuItem => {
  const { baseItem, setCreateUpdateIssueModal, setDuplicateWorkItemModal, workspaceSlug } = props;

  const isDuplicateEnabled = workspaceSlug ? store.featureFlags.flags[workspaceSlug]?.COPY_WORK_ITEM : false;

  if (setDuplicateWorkItemModal && isDuplicateEnabled) {
    return {
      ...baseItem,
      nestedMenuItems: [
        {
          key: "copy-in-same-project",
          title: "Copy in same project",
          action: () => {
            captureClick({
              elementName: WORK_ITEM_TRACKER_ELEMENTS_EXTENDED.COPY_IN_SAME_PROJECT,
            });
            setCreateUpdateIssueModal(true);
          },
        },
        {
          key: "copy-in-different-project",
          title: "Copy in different project",
          action: () => {
            captureClick({
              elementName: WORK_ITEM_TRACKER_ELEMENTS_EXTENDED.COPY_IN_DIFFERENT_PROJECT,
            });
            setDuplicateWorkItemModal(true);
          },
        },
      ],
    };
  }

  return baseItem;
};
