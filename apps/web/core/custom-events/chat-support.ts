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

type ChatSupportType = "open";

type ChatSupportEventType = `chat-support:${ChatSupportType}`;

export const CHAT_SUPPORT_EVENTS = {
  open: "chat-support:open",
} satisfies Record<ChatSupportType, ChatSupportEventType>;

export class ChatSupportEvent extends CustomEvent<ChatSupportType> {
  constructor(type: ChatSupportType) {
    super(CHAT_SUPPORT_EVENTS[type]);
  }
}
