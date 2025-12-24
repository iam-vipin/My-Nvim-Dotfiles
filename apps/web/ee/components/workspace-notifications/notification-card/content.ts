import type { TNotificationContentMap } from "@/components/workspace-notifications/sidebar/notification-card/content";
import { getPageName, replaceUnderscoreIfSnakeCase } from "@plane/utils";

export const renderAdditionalAction = (notificationField: string, verb: string | undefined) => {
  if (notificationField === "page") return verb === "added" ? "added a new page" : "removed the page";
  const baseAction = !["comment", "archived_at"].includes(notificationField) ? verb : "";
  return `${baseAction} ${replaceUnderscoreIfSnakeCase(notificationField)}`;
};

export const renderAdditionalValue = (
  notificationField: string | undefined,
  newValue: string | undefined,
  oldValue: string | undefined
) => {
  if (notificationField === "page") return getPageName(newValue || oldValue || "");
  return newValue;
};

export const shouldShowConnector = (notificationField: string | undefined) =>
  !["comment", "archived_at", "None", "assignees", "labels", "start_date", "target_date", "parent", "page"].includes(
    notificationField || ""
  );

export const shouldRender = (notificationField: string | undefined, verb: string | undefined) =>
  verb !== "deleted" || (verb === "deleted" && notificationField === "page");

export const ADDITIONAL_NOTIFICATION_CONTENT_MAP: TNotificationContentMap = {};
