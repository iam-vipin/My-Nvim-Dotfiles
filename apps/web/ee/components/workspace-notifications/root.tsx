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

import { observer } from "mobx-react";
import { WithFeatureFlagHOC } from "@/components/feature-flags";
import { NotificationCardListRoot as NotificationCardListRootCe } from "ce/components/workspace-notifications/notification-card/root";
import type { TNotificationListRoot } from "ce/components/workspace-notifications/root";
import { NotificationCardListRoot as NotificationCardListRootEe } from "./notification-card/root";

export const NotificationListRoot = observer(function NotificationListRoot(props: TNotificationListRoot) {
  const { workspaceSlug, workspaceId, onNotificationClick } = props;
  return (
    <WithFeatureFlagHOC
      workspaceSlug={workspaceSlug.toString()}
      flag="INBOX_STACKING"
      fallback={
        <NotificationCardListRootCe
          workspaceSlug={workspaceSlug.toString()}
          workspaceId={workspaceId}
          onNotificationClick={onNotificationClick}
        />
      }
    >
      <NotificationCardListRootEe
        workspaceSlug={workspaceSlug.toString()}
        workspaceId={workspaceId}
        onNotificationClick={onNotificationClick}
      />
    </WithFeatureFlagHOC>
  );
});
