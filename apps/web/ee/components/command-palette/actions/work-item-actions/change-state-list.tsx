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

import { Command } from "cmdk";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { CheckIcon, StateGroupIcon } from "@plane/propel/icons";
// plane imports
import { EIconSize } from "@plane/constants";
import { Tooltip } from "@plane/propel/tooltip";
import { Spinner } from "@plane/ui";
// ce imports
import type { TChangeWorkItemStateListProps } from "@/ce/components/command-palette/actions/work-item-actions";
import { ChangeWorkItemStateList as ChangeWorkItemStateListCE } from "@/ce/components/command-palette/actions/work-item-actions";
// store hooks
import { useProjectState } from "@/hooks/store/use-project-state";
// plane web imports
import { WorkFlowDisabledMessage } from "@/plane-web/components/workflow";

export const ChangeWorkItemStateList = observer(function ChangeWorkItemStateList(props: TChangeWorkItemStateListProps) {
  const { projectId, currentStateId, handleStateChange } = props;
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { getProjectStates, getIsWorkflowEnabled, getAvailableProjectStateIdMap } = useProjectState();
  // derived values
  const projectStates = getProjectStates(projectId);
  const isWorkflowEnabled = getIsWorkflowEnabled(workspaceSlug.toString(), projectId);
  const availableStateIdMap = getAvailableProjectStateIdMap(projectId, currentStateId);

  if (!isWorkflowEnabled) {
    return <ChangeWorkItemStateListCE {...props} />;
  }

  const getIsDisabled = (selectedStateId: string) =>
    selectedStateId !== currentStateId && !availableStateIdMap[selectedStateId];

  return (
    <>
      {projectStates ? (
        projectStates.length > 0 ? (
          projectStates.map((state) => {
            const isDisabled = getIsDisabled(state.id);
            const isSelected = state.id === currentStateId;
            return (
              <Tooltip
                key={state.id}
                tooltipContent={<WorkFlowDisabledMessage parentStateId={currentStateId ?? ""} />}
                position="right-start"
                className="border-[0.5px] border-subtle-1 mx-0.5 shadow-lg"
                disabled={!isDisabled}
              >
                <Command.Item
                  key={state.id}
                  onSelect={() => handleStateChange(state.id)}
                  className={"focus:outline-none"}
                  disabled={isDisabled}
                >
                  <div className="flex items-center space-x-3">
                    <StateGroupIcon stateGroup={state.group} color={state.color} size={EIconSize.MD} />
                    <p>{state.name}</p>
                  </div>
                  <div>{isSelected && <CheckIcon className="h-3 w-3" />}</div>
                </Command.Item>
              </Tooltip>
            );
          })
        ) : (
          <div className="text-center">No states found</div>
        )
      ) : (
        <Spinner />
      )}
    </>
  );
});
