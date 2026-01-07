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
import { observer } from "mobx-react";
// plane imports
import { cn } from "@plane/utils";
//
import { useGanttChart } from "../..";
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from "../../constants";
import type { IMonthBlock } from "../../views";

export const MonthChartView = observer(function MonthChartView(_props: any) {
  // chart hook
  const { currentViewData, renderView } = useGanttChart();
  const monthBlocks: IMonthBlock[] = renderView;

  return (
    <div className="absolute top-0 left-0 min-h-full h-max w-max flex divide-x divide-subtle-1">
      {monthBlocks?.map((block, rootIndex) => (
        <div key={`month-${block?.month}-${block?.year}`} className="relative flex flex-col">
          <div
            className="w-full sticky top-0 z-[5] bg-surface-1 flex-shrink-0"
            style={{
              height: `${HEADER_HEIGHT}px`,
            }}
          >
            <div className="h-1/2">
              <div
                className="sticky inline-flex whitespace-nowrap px-3 py-2 text-11 font-medium capitalize"
                style={{
                  left: `${SIDEBAR_WIDTH}px`,
                }}
              >
                {block?.title}
              </div>
            </div>
            <div className="h-1/2 w-full flex">
              {block?.children?.map((monthDay, index) => (
                <div
                  key={`sub-title-${rootIndex}-${index}`}
                  className="flex-shrink-0 border-b-[0.5px] border-subtle-1 py-1 text-center capitalize"
                  style={{ width: `${currentViewData?.data.width}px` }}
                >
                  <div className="space-x-1 text-11">
                    <span className="text-secondary">{monthDay.dayData.shortTitle[0]}</span>{" "}
                    <span
                      className={cn({
                        "rounded-full bg-accent-primary px-1 text-on-color": monthDay.today,
                      })}
                    >
                      {monthDay.day}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-full w-full flex-grow flex divide-x divide-subtle">
            {block?.children?.map((monthDay, index) => (
              <div
                key={`column-${rootIndex}-${index}`}
                className="h-full overflow-hidden"
                style={{ width: `${currentViewData?.data.width}px` }}
              >
                {["sat", "sun"].includes(monthDay?.dayData?.shortTitle) && <div className="h-full bg-layer-1" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
