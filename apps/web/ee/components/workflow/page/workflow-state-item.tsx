import type { FC } from "react";
import { observer } from "mobx-react";
// plane imports
import type { IState } from "@plane/types";
import { cn } from "@plane/utils";
// local imports
import { StateItemChild } from "../state";

type TStateItem = {
  workspaceSlug: string;
  projectId: string;
  totalStates: number;
  state: IState;
};

export const WorkflowStateItem = observer(function WorkflowStateItem(props: TStateItem) {
  const { workspaceSlug, projectId, totalStates, state } = props;

  return (
    <div className={cn("relative border border-subtle rounded-sm group")}>
      <StateItemChild workspaceSlug={workspaceSlug} projectId={projectId} stateCount={totalStates} state={state} />
    </div>
  );
});
