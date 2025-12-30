import { observer } from "mobx-react";
import { MessageSquare } from "lucide-react";
// plane imports
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
// components
import { NotificationItemOptionButton } from "@/components/workspace-notifications/sidebar/notification-card/options";
// hooks
import { useWorkspaceNotifications } from "@/hooks/store/notifications";
// store
import type { INotification } from "@/store/notifications/notification";

type TNotificationItemReadOption = {
  workspaceSlug: string;
  notificationList: INotification[];
  issueId: string;
  unreadCount: number;
};

export const NotificationItemReadOption = observer(function NotificationItemReadOption(
  props: TNotificationItemReadOption
) {
  const { workspaceSlug, notificationList, unreadCount } = props;

  const { markBulkNotificationsAsRead, markBulkNotificationsAsUnread } = useWorkspaceNotifications();

  const handleNotificationUpdate = async () => {
    try {
      const request = unreadCount === 0 ? markBulkNotificationsAsUnread : markBulkNotificationsAsRead;
      await request(notificationList, workspaceSlug);
      setToast({
        title: unreadCount === 0 ? "Notification(s) marked as unread" : "Notification(s) marked as read",
        type: TOAST_TYPE.SUCCESS,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <NotificationItemOptionButton
      tooltipContent={unreadCount === 0 ? "Mark as unread" : "Mark as read"}
      callBack={handleNotificationUpdate}
    >
      <MessageSquare className="h-3 w-3 text-tertiary" />
    </NotificationItemOptionButton>
  );
});
