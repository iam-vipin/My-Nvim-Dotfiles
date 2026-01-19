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
