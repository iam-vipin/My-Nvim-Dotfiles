import React from "react";
import { observer } from "mobx-react";
// components
import { GANTT_TIMELINE_TYPE } from "@plane/types";
import { TimeLineTypeContext } from "@/components/gantt-chart/contexts";
// local imports
import { WorkspaceGanttChart } from "./workspace-gantt-chart";

type Props = {
  isLoading?: boolean;
  workspaceSlug: string;
  globalViewId: string;
  fetchNextPages: () => void;
  issuesLoading: boolean;
};

export const WorkspaceGanttRoot = observer(function WorkspaceGanttRoot(props: Props) {
  const { isLoading = false, workspaceSlug, globalViewId, fetchNextPages, issuesLoading } = props;

  return (
    <TimeLineTypeContext.Provider value={GANTT_TIMELINE_TYPE.ISSUE}>
      <WorkspaceGanttChart
        isLoading={isLoading}
        workspaceSlug={workspaceSlug}
        globalViewId={globalViewId}
        fetchNextPages={fetchNextPages}
        issuesLoading={issuesLoading}
      />
    </TimeLineTypeContext.Provider>
  );
});
