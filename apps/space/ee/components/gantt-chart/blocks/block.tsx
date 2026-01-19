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

import { observer } from "mobx-react";
// plane imports
import { cn } from "@plane/utils";
// hooks
import { useIssueDetails } from "@/hooks/store/use-issue-details";
// constants
import { BLOCK_HEIGHT } from "../constants";
// components
import { ChartScrollable } from "../helpers";
import { useGanttChart } from "../hooks";
import type { ChartDataType, IGanttBlock } from "../types";

type Props = {
  blockId: string;
  getBlockById: (id: string, currentViewData?: ChartDataType) => IGanttBlock | undefined;
  showAllBlocks: boolean;
  blockToRender: (data: any) => React.ReactNode;
  ganttContainerRef: React.RefObject<HTMLDivElement>;
};

export const GanttChartBlock = observer(function GanttChartBlock(props: Props) {
  const { blockId, getBlockById, showAllBlocks, blockToRender, ganttContainerRef } = props;
  // store hooks
  const { currentViewData, updateActiveBlockId, isBlockActive } = useGanttChart();
  const { getIsIssuePeeked } = useIssueDetails();

  const block = getBlockById(blockId, currentViewData);

  // hide the block if it doesn't have start and target dates and showAllBlocks is false
  if (!block || (!showAllBlocks && !(block.start_date && block.target_date))) return null;

  if (!block.data) return null;

  const isBlockHoveredOn = isBlockActive(block.id);

  return (
    <div
      className="relative min-w-full w-max"
      style={{
        height: `${BLOCK_HEIGHT}px`,
      }}
    >
      <div
        className={cn("relative h-full", {
          "rounded-l border border-r-0 border-accent-strong": getIsIssuePeeked(block.data.id),
          "bg-layer-1": isBlockHoveredOn,
          "bg-accent-primary/10": isBlockHoveredOn,
        })}
        onMouseEnter={() => updateActiveBlockId(blockId)}
        onMouseLeave={() => updateActiveBlockId(null)}
      >
        <ChartScrollable block={block} blockToRender={blockToRender} ganttContainerRef={ganttContainerRef} />
      </div>
    </div>
  );
});
