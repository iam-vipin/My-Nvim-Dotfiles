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
import { useParams } from "next/navigation";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web imports
import { useWorkspaceProjectStates } from "@/plane-web/hooks/store";
import type { TProject } from "@/types/projects";
// local imports
import { StateDropdown } from "../../../dropdowns/state-dropdown";

type Props = {
  project: TProject;
  onClose?: () => void;
  onChange: (project: TProject, data: Partial<TProject>) => void;
  disabled: boolean;
};

export const SpreadsheetStateColumn = observer(function SpreadsheetStateColumn(props: Props) {
  const { project, onChange, disabled } = props;
  const { workspaceSlug } = useParams();
  const { currentWorkspace } = useWorkspace();
  const { getProjectById } = useProject();
  const { defaultState } = useWorkspaceProjectStates();

  // derived values
  const projectDetails = getProjectById(project.id);
  const selectedId = projectDetails?.state_id || defaultState;
  return (
    <div className="h-11 border-b-[0.5px] border-subtle-1">
      {currentWorkspace?.id && (
        <StateDropdown
          workspaceSlug={workspaceSlug.toString()}
          workspaceId={currentWorkspace.id}
          onChange={(data) => onChange(project, { state_id: data })}
          className="h-full "
          buttonClassName="h-full m-auto border-none px-4 rounded-none"
          value={selectedId!}
          disabled={disabled}
        />
      )}
    </div>
  );
});
