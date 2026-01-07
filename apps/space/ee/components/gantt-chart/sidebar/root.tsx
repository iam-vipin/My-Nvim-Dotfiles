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

import type { RefObject } from "react";
import { observer } from "mobx-react";
// plane imports
import { cn } from "@plane/utils";
// components
import type { ChartDataType, IGanttBlock } from "../";
// constants
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "../constants";

type Props = {
  blockIds: string[];
  canLoadMoreBlocks?: boolean;
  loadMoreBlocks?: () => void;
  ganttContainerRef: RefObject<HTMLDivElement>;
  sidebarToRender: (props: any) => React.ReactNode;
  title: string;
  getBlockById: (id: string, currentViewData?: ChartDataType) => IGanttBlock | undefined;
};

export const GanttChartSidebar = observer(function GanttChartSidebar(props: Props) {
  const { blockIds, sidebarToRender, getBlockById, loadMoreBlocks, canLoadMoreBlocks, ganttContainerRef, title } =
    props;

  return (
    <div
      // DO NOT REMOVE THE ID
      id="gantt-sidebar"
      className="sticky left-0 z-10 min-h-full h-max flex-shrink-0 border-r-[0.5px] border-subtle-1 bg-surface-1"
      style={{
        width: `${SIDEBAR_WIDTH}px`,
      }}
    >
      <div
        className="group/list-header box-border flex-shrink-0 flex items-end justify-between gap-2 border-b-[0.5px] border-subtle-1 pb-2 pl-2 pr-4 text-13 font-medium text-tertiary sticky top-0 z-10 bg-surface-1 "
        style={{
          height: `${HEADER_HEIGHT}px`,
        }}
      >
        <div className={cn("flex items-center gap-2 pl-2")}>
          <h6>{title}</h6>
        </div>
        <h6>Duration</h6>
      </div>

      <div className="min-h-full h-max overflow-hidden">
        {sidebarToRender &&
          sidebarToRender({
            title,
            blockIds,
            getBlockById,
            canLoadMoreBlocks,
            ganttContainerRef,
            loadMoreBlocks,
          })}
      </div>
    </div>
  );
});
