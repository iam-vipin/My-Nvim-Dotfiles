import { observer } from "mobx-react";
import { ArchiveRestoreIcon, LockKeyhole, LockKeyholeOpen } from "lucide-react";
// plane imports
import type { EditorRefApi } from "@plane/editor";
import { ArchiveIcon } from "@plane/propel/icons";
import type { TContextMenuItem } from "@plane/ui";
// components
import type { TPageActions } from "@/components/pages/dropdowns";
// hooks
import type { TPageOperations } from "@/hooks/use-page-operations";
// plane web imports
import type { EPageStoreType } from "@/plane-web/hooks/store";
// store
import type { TPageInstance } from "@/store/pages/base-page";

export const usePageActionsMenu = (props: {
  page: TPageInstance;
  storeType: EPageStoreType;
  editorRef?: EditorRefApi | null;
  pageOperations: TPageOperations;
}) => {
  const { page, pageOperations } = props;

  // derived values
  const { is_locked, archived_at, canCurrentUserLockPage, canCurrentUserArchivePage } = page;

  // In CE version, we implement basic functionality without modals
  const customMenuItems: (TContextMenuItem & { key: TPageActions })[] = [
    {
      key: "toggle-lock",
      action: () => pageOperations.toggleLock({ recursive: false }),
      title: is_locked ? "Unlock" : "Lock",
      icon: is_locked ? LockKeyholeOpen : LockKeyhole,
      shouldRender: canCurrentUserLockPage,
    },
    {
      key: "archive-restore",
      action: pageOperations.toggleArchive,
      title: archived_at ? "Restore" : "Archive",
      icon: archived_at ? ArchiveRestoreIcon : ArchiveIcon,
      shouldRender: canCurrentUserArchivePage,
    },
  ];

  // Empty modals component
  const ModalsComponent = observer(function ModalsComponent() {
    return <></>;
  });

  return {
    customMenuItems,
    ModalsComponent,
  };
};
