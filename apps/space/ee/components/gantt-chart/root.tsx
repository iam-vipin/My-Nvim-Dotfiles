import type { FC } from "react";
// context
import { GanttStoreProvider } from "./contexts";
// components
import type { ChartDataType, IGanttBlock } from ".";
import { ChartViewRoot } from ".";

type GanttChartRootProps = {
  border?: boolean;
  title: string;
  blockIds: string[];
  blockToRender: (data: any) => React.ReactNode;
  sidebarToRender: (props: any) => React.ReactNode;
  getBlockById: (id: string, currentViewData?: ChartDataType) => IGanttBlock | undefined;
  canLoadMoreBlocks?: boolean;
  loadMoreBlocks?: () => void;
  bottomSpacing?: boolean;
  showAllBlocks?: boolean;
};

export function GanttChartRoot(props: GanttChartRootProps) {
  const {
    border = true,
    title,
    blockIds,
    sidebarToRender,
    blockToRender,
    getBlockById,
    loadMoreBlocks,
    canLoadMoreBlocks,
    bottomSpacing = false,
    showAllBlocks = false,
  } = props;

  return (
    <GanttStoreProvider>
      <ChartViewRoot
        border={border}
        title={title}
        blockIds={blockIds}
        getBlockById={getBlockById}
        loadMoreBlocks={loadMoreBlocks}
        canLoadMoreBlocks={canLoadMoreBlocks}
        sidebarToRender={sidebarToRender}
        blockToRender={blockToRender}
        bottomSpacing={bottomSpacing}
        showAllBlocks={showAllBlocks}
      />
    </GanttStoreProvider>
  );
}
