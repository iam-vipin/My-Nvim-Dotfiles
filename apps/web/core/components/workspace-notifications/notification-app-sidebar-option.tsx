/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import type { FC } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { getNumberCount } from "@plane/utils";
// components
import { CountChip } from "@/components/common/count-chip";
// hooks
import { useWorkspaceNotifications } from "@/hooks/store/notifications";

type TNotificationAppSidebarOption = {
  workspaceSlug: string;
};

export const NotificationAppSidebarOption = observer(function NotificationAppSidebarOption(
  props: TNotificationAppSidebarOption
) {
  const { workspaceSlug } = props;
  // hooks
  const { unreadNotificationsCount, getUnreadNotificationsCount } = useWorkspaceNotifications();

  useSWR(
    workspaceSlug ? "WORKSPACE_UNREAD_NOTIFICATION_COUNT" : null,
    workspaceSlug ? () => getUnreadNotificationsCount(workspaceSlug) : null
  );

  // derived values
  const isMentionsEnabled = unreadNotificationsCount.mention_unread_notifications_count > 0 ? true : false;
  const totalNotifications = isMentionsEnabled
    ? unreadNotificationsCount.mention_unread_notifications_count
    : unreadNotificationsCount.total_unread_notifications_count;

  if (totalNotifications <= 0) return <></>;

  return (
    <div className="ml-auto">
      <CountChip count={`${isMentionsEnabled ? `@ ` : ``}${getNumberCount(totalNotifications)}`} />
    </div>
  );
});
