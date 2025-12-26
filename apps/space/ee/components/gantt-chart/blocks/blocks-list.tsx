import type { FC } from "react";
// hooks
// constants
import { HEADER_HEIGHT } from "../constants";
// types
import type { ChartDataType, IGanttBlock } from "../types";
// components
import { GanttChartBlock } from "./block";

export type GanttChartBlocksProps = {
  itemsContainerWidth: number;
  blockIds: string[];
  getBlockById: (id: string, currentViewData?: ChartDataType) => IGanttBlock | undefined;
  blockToRender: (data: any) => React.ReactNode;
  ganttContainerRef: React.RefObject<HTMLDivElement>;
  showAllBlocks: boolean;
};

export function GanttChartBlocksList(props: GanttChartBlocksProps) {
  const { itemsContainerWidth, blockIds, blockToRender, getBlockById, ganttContainerRef, showAllBlocks } = props;

  return (
    <div
      className="h-full"
      style={{
        width: `${itemsContainerWidth}px`,
        transform: `translateY(${HEADER_HEIGHT}px)`,
      }}
    >
      {blockIds?.map((blockId) => (
        <GanttChartBlock
          key={blockId}
          blockId={blockId}
          getBlockById={getBlockById}
          showAllBlocks={showAllBlocks}
          blockToRender={blockToRender}
          ganttContainerRef={ganttContainerRef}
        />
      ))}
    </div>
  );
}
