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

import type { PlaneUser } from "@plane/sdk";

export type EmailUser =
  | {
      emailAddress?: string;
    }
  | string;

export const compareAndGetAdditionalUsers = (planeMembers: PlaneUser[], sourceMembers: EmailUser[]) => {
  // Create a Set of plane member emails for O(1) lookup
  const planeMemberEmails = new Set(planeMembers.map((member) => member.email));
  // Filter source members in a single pass
  return sourceMembers
    .map((member) => (typeof member === "string" ? member : member.emailAddress))
    .filter((email): email is string => email !== undefined && !planeMemberEmails.has(email));
};
