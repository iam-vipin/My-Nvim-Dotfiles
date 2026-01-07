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

const workspaceScopes: string[] = [
  "app_mentions:read",
  "channels:read",
  "channels:join",
  "users:read",
  "users:read.email",
  "chat:write",
  "channels:history",
  "groups:history",
  "mpim:history",
  "commands",
  "links:read",
  "links:write",
  "groups:read",
  "reactions:read",
  "reactions:write",
  "files:read",
];

export const getWorkspaceAuthScopes = () => workspaceScopes.join(",");

const userScopes: string[] = ["chat:write"];

export const getUserAuthScopes = () => userScopes.join(",");

// These are not used in the code, but are set on the application directly
// keeping these here for reference
const _eventSubscriptions: string[] = [
  "app_mention",
  "app_uninstalled",
  "channel_left",
  "link_shared",
  "message.channels",
  "message.groups",
  "message.mpim",
];
