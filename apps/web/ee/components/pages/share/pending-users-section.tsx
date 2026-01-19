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

import React from "react";
// plane imports
import type { EPageSharedUserAccess } from "@plane/types";
// local imports
import type { TPendingSharedUser } from "./types";
import { UserListItem } from "./user-list-item";

type TPendingUsersSectionProps = {
  pendingUsers: TPendingSharedUser[];
  onUpdateAccess: (userId: string, access: EPageSharedUserAccess) => void;
  onRemove: (userId: string) => void;
  getMemberDetails: (userId: string) => { member: { display_name: string; avatar_url: string } };
  canCurrentUserChangeAccess?: boolean;
};

export function PendingUsersSection({
  pendingUsers,
  onUpdateAccess,
  onRemove,
  getMemberDetails,
  canCurrentUserChangeAccess = true,
}: TPendingUsersSectionProps) {
  if (pendingUsers.length === 0) return null;

  return (
    <div className="mt-3 space-y-2 transition-all duration-300 ease-in-out">
      {pendingUsers.map((user) => {
        const memberDetails = getMemberDetails(user.user_id);
        return (
          <UserListItem
            key={user.user_id}
            userId={user.user_id}
            displayName={memberDetails?.member?.display_name}
            avatarUrl={memberDetails?.member?.avatar_url}
            access={user.access}
            onUpdateAccess={canCurrentUserChangeAccess ? onUpdateAccess : () => {}}
            onRemove={canCurrentUserChangeAccess ? onRemove : () => {}}
            canCurrentUserChangeAccess={canCurrentUserChangeAccess}
            className="p-1 transition-all duration-200 ease-in-out"
          />
        );
      })}
    </div>
  );
}

PendingUsersSection.displayName = "PendingUsersSection";
