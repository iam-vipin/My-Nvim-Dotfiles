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

export const notificationModal = (notifcationsText: string[]) => ({
  type: "Notifications",
  title: {
    type: "plain_text",
    text: "Plane",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true,
  },
  blocks: notifcationsText.map((notification: string) => ({
    type: "section",
    text: {
      type: "plain_text",
      text: notification,
      emoji: true,
    },
  })),
});
