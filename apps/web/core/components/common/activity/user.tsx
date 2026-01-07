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

import type { FC } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
// types
import type { TWorkspaceBaseActivity } from "@plane/types";
// store hooks
import { useMember } from "@/hooks/store/use-member";
import { useWorkspace } from "@/hooks/store/use-workspace";

type TUser = {
  activity: TWorkspaceBaseActivity;
  customUserName?: string;
};

export const User = observer(function User(props: TUser) {
  const { activity, customUserName } = props;
  // store hooks
  const { getUserDetails } = useMember();
  const { getWorkspaceById } = useWorkspace();
  // derived values
  const actorDetail = getUserDetails(activity.actor);
  const workspaceDetail = getWorkspaceById(activity.workspace);

  return (
    <>
      {customUserName || actorDetail?.display_name.includes("-intake") ? (
        <span className="text-primary font-medium">{customUserName || "Plane"}</span>
      ) : (
        <Link
          href={`/${workspaceDetail?.slug}/profile/${actorDetail?.id}`}
          className="hover:underline text-primary font-medium"
        >
          {actorDetail?.display_name}
        </Link>
      )}
    </>
  );
});
