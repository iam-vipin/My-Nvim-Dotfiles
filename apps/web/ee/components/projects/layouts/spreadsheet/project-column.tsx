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

import { useRef } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// types
import { EUserPermissionsLevel } from "@plane/constants";
import { EUserProjectRoles } from "@plane/types";
import { useUserPermissions } from "@/hooks/store/user";
import type { IProjectDisplayProperties } from "@/plane-web/constants/project/spreadsheet";
import { SPREADSHEET_PROPERTY_DETAILS } from "@/plane-web/constants/project/spreadsheet";
import type { TProject } from "@/types/projects";

type Props = {
  projectDetails: TProject;
  disableUserActions: boolean;
  property: keyof IProjectDisplayProperties;
  updateProject: ((projectId: string | null, data: Partial<TProject>) => Promise<TProject>) | undefined;
};

export const ProjectColumn = observer(function ProjectColumn(props: Props) {
  const { projectDetails, property, updateProject } = props;
  // router
  const { workspaceSlug } = useParams();
  // refs
  const tableCellRef = useRef<HTMLTableCellElement | null>(null);
  // store hooks
  const { allowPermissions } = useUserPermissions();
  // derived values
  const { Column } = SPREADSHEET_PROPERTY_DETAILS[property];
  const isEditingAllowed = allowPermissions(
    [EUserProjectRoles.ADMIN],
    EUserPermissionsLevel.PROJECT,
    workspaceSlug?.toString(),
    projectDetails.id
  );

  return (
    <td
      tabIndex={0}
      className="h-11 w-full min-w-36 max-w-48 text-13 after:absolute after:w-full after:bottom-[-1px] after:border after:border-subtle border-r-[1px] border-subtle"
      ref={tableCellRef}
    >
      <Column
        project={projectDetails}
        onChange={(project: TProject, data: Partial<TProject>) => {
          if (updateProject) {
            updateProject(project.id, data);
          }
        }}
        disabled={!isEditingAllowed}
      />
    </td>
  );
});
