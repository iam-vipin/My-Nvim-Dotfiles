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
import Link from "next/link";
import { useParams } from "next/navigation";
// helpers
import { cn, getFileURL } from "@plane/utils";
// hooks
import { useMember } from "@/hooks/store/use-member";
import type { TProject } from "@/plane-web/types/projects";

type Props = {
  project: TProject;
};

export const SpreadsheetLeadColumn = observer(function SpreadsheetLeadColumn(props: Props) {
  const { project } = props;

  // hooks
  const { workspaceSlug } = useParams();
  const {
    workspace: { getWorkspaceMemberDetails },
  } = useMember();
  const lead = getWorkspaceMemberDetails(project.project_lead as string);

  return (
    <div
      className={cn(
        "flex gap-x-2 gap-y-2 h-11 w-full items-center border-b-[0.5px] border-subtle-1 px-4 py-1 text-11 hover:bg-layer-1 group-[.selected-project-row]:bg-accent-primary/5 group-[.selected-project-row]:hover:bg-accent-primary/10"
      )}
    >
      {lead ? (
        <>
          {lead.member.avatar_url && lead.member.avatar_url.trim() !== "" ? (
            <Link href={`/${workspaceSlug}/profile/${lead.member.id}`}>
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full capitalize text-on-color ">
                <img
                  width={20}
                  src={getFileURL(lead.member.avatar_url)}
                  className="absolute left-0 top-0 h-5 w-5  rounded-full object-cover"
                  alt={lead.member.display_name || lead.member.email}
                />
              </span>
            </Link>
          ) : (
            <Link href={`/${workspaceSlug}/profile/${lead.member.id}`}>
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 capitalize text-on-color">
                {(lead.member.email ?? lead.member.display_name ?? "?")[0]}
              </span>
            </Link>
          )}
          {lead.member.first_name} {lead.member.last_name}
        </>
      ) : (
        "-"
      )}{" "}
    </div>
  );
});
