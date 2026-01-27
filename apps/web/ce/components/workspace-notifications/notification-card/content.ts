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

import { replaceUnderscoreIfSnakeCase } from "@plane/utils";
import type { TNotificationContentMap } from "@/components/workspace-notifications/sidebar/notification-card/content";

// Additional notification content map for CE (empty - EE extends this)
export const ADDITIONAL_NOTIFICATION_CONTENT_MAP: TNotificationContentMap = {};

// Fallback action renderer for fields not in the map
export const renderAdditionalAction = (notificationField: string, verb: string | undefined) => {
  const baseAction = !["comment", "archived_at"].includes(notificationField) ? verb : "";
  return `${baseAction} ${replaceUnderscoreIfSnakeCase(notificationField)}`;
};

// Fallback value renderer for fields not in the map
export const renderAdditionalValue = (
  _notificationField: string | undefined,
  newValue: string | undefined,
  _oldValue: string | undefined
) => newValue;

export const shouldShowConnector = (notificationField: string | undefined) =>
  !["comment", "archived_at", "None", "assignees", "labels", "start_date", "target_date", "parent"].includes(
    notificationField || ""
  );

export const shouldRender = (notificationField: string | undefined, verb: string | undefined) => verb !== "deleted";
