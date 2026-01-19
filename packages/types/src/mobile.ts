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

import type { IInstanceConfig } from "./instance";
import type { IUser } from "./users";
import type { IWorkspaceMemberInvitation } from "./workspace";

// instance types
export type TInstanceConfig = IInstanceConfig;

// authentication types
export type TMobileCSRFToken = {
  csrf_token: string;
};

export type TEmailCheckRequest = {
  email: string;
};

export type TEmailCheckResponse = {
  status: "MAGIC_CODE" | "CREDENTIAL";
  existing: boolean;
  is_password_autoset: boolean;
};

// user types
export type TMobileUser = IUser;

// workspace invitation types
export type TMobileWorkspaceInvitation = Omit<IWorkspaceMemberInvitation, "invite_link" | "token">;
