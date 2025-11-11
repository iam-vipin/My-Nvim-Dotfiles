"use client";

import { observer } from "mobx-react";
// plane types
import { StateGroupIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
// ce imports
import type { TPowerKProjectStatesMenuItemsProps } from "@/ce/components/command-palette/power-k/pages/context-based/work-item/state-menu-item";
import { PowerKProjectStatesMenuItems as PowerKProjectStatesMenuItemsCE } from "@/ce/components/command-palette/power-k/pages/context-based/work-item/state-menu-item";
// components
import { PowerKModalCommandItem } from "@/components/power-k/ui/modal/command-item";
import { useProjectState } from "@/hooks/store/use-project-state";
// plane web imports
import { WorkFlowDisabledMessage } from "@/plane-web/components/workflow/workflow-tree/workflow-disabled-message";

export const PowerKProjectStatesMenuItems: React.FC<TPowerKProjectStatesMenuItemsProps> = observer((props) => {
  const { handleSelect, projectId, selectedStateId, states, workspaceSlug } = props;
  // store hooks
  const { getIsWorkflowEnabled, getAvailableProjectStateIdMap } = useProjectState();
  // derived values
  const isWorkflowEnabled = getIsWorkflowEnabled(workspaceSlug, projectId);
  const availableStateIdMap = getAvailableProjectStateIdMap(projectId, selectedStateId);

  if (!isWorkflowEnabled) {
    return <PowerKProjectStatesMenuItemsCE {...props} />;
  }

  return (
    <>
      {states.map((state) => {
        const isDisabled = state.id !== selectedStateId && !availableStateIdMap[state.id];
        const isSelected = state.id === selectedStateId;
        return (
          <Tooltip
            key={state.id}
            tooltipContent={<WorkFlowDisabledMessage parentStateId={selectedStateId ?? ""} />}
            position="right-start"
            className="border-[0.5px] border-custom-border-300 mx-0.5 shadow-lg"
            disabled={!isDisabled}
          >
            <div>
              <PowerKModalCommandItem
                key={state.id}
                iconNode={<StateGroupIcon stateGroup={state.group} color={state.color} className="shrink-0 size-3.5" />}
                label={state.name}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onSelect={() => handleSelect(state.id)}
              />
            </div>
          </Tooltip>
        );
      })}
    </>
  );
});
