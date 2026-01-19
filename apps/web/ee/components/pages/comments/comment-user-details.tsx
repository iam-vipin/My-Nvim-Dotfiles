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
import { observer } from "mobx-react";
import { cn } from "@plane/utils";
// hooks
import { useMember } from "@/hooks/store/use-member";
// local components
import { PageCommentTimestampDisplay } from "./comment-timestamp-display";

type PageCommentUserDetailsProps = {
  userId: string;
  timestamp?: string;
  className?: string;
};

export const PageCommentUserDetails = observer(function PageCommentUserDetails({
  userId,
  timestamp,
  className = "",
}: PageCommentUserDetailsProps) {
  const {
    workspace: { getWorkspaceMemberDetails },
  } = useMember();

  const memberDetails = getWorkspaceMemberDetails(userId);

  return (
    <div className={cn("flex items-baseline gap-2 flex-1", className)}>
      <div className="text-primary text-13 font-medium truncate">{memberDetails?.member.display_name}</div>
      {timestamp && <PageCommentTimestampDisplay timestamp={timestamp} />}
    </div>
  );
});
