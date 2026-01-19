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
