import { observer } from "mobx-react";
import { useTimeLineType } from "@/components/gantt-chart/contexts";
import { MilestoneIndicatorsRoot } from "./milestone-indicators-root";

type Props = {
  itemsContainerWidth: number;
  blockCount: number;
};

export const GanttAdditionalLayers = observer(function GanttAdditionalLayers({ blockCount }: Props) {
  const timelineType = useTimeLineType();
  if (!timelineType) return null;
  return (
    <>
      <MilestoneIndicatorsRoot timelineType={timelineType} blockCount={blockCount} />
      {/* Future additional layers can be added here */}
    </>
  );
});
