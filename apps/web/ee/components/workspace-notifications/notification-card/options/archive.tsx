import { observer } from "mobx-react";
import { ArchiveRestore } from "lucide-react";
// plane imports
import { NOTIFICATION_TRACKER_ELEMENTS, NOTIFICATION_TRACKER_EVENTS } from "@plane/constants";
import { ArchiveIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
// components
import { NotificationItemOptionButton } from "@/components/workspace-notifications/sidebar/notification-card/options";
// hooks
import { useWorkspaceNotifications } from "@/hooks/store/notifications";
// store
import type { INotification } from "@/store/notifications/notification";

type TNotificationItemArchiveOption = {
  workspaceSlug: string;
  notificationList: INotification[];
  issueId?: string;
};

export const NotificationItemArchiveOption = observer(function NotificationItemArchiveOption(
  props: TNotificationItemArchiveOption
) {
  const { workspaceSlug, notificationList } = props;

  //derived values
  const archivedCount = notificationList.filter((n) => !!n.archived_at).length;

  const { archiveNotificationList, unArchiveNotificationList } = useWorkspaceNotifications();

  const handleNotificationUpdate = async () => {
    try {
      const request = archivedCount > 0 ? unArchiveNotificationList : archiveNotificationList;
      await request(notificationList, workspaceSlug);
      setToast({
        title: archivedCount > 0 ? "Notification(s) un-archived" : "Notification(s) archived",
        type: TOAST_TYPE.SUCCESS,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <NotificationItemOptionButton
      tooltipContent={archivedCount > 0 ? "Un archive" : "Archive"}
      callBack={handleNotificationUpdate}
    >
      {archivedCount > 0 ? (
        <ArchiveRestore className="h-3 w-3 text-tertiary" />
      ) : (
        <ArchiveIcon className="h-3 w-3 text-tertiary" />
      )}
    </NotificationItemOptionButton>
  );
});
