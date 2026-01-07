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
// hooks
import { useGanttChart } from "../..";

export const QuarterChartView = observer(function QuarterChartView(_props: any) {
  const { currentViewData, renderView } = useGanttChart();

  return (
    <>
      <div className="absolute flex h-full flex-grow divide-x divide-subtle-1">
        {renderView &&
          renderView.length > 0 &&
          renderView.map((_itemRoot: any, _idxRoot: any) => (
            <div key={`title-${_idxRoot}`} className="relative flex flex-col">
              <div className="relative border-b border-subtle-1">
                <div className="sticky left-0 inline-flex whitespace-nowrap px-2 py-1 text-13 font-medium capitalize">
                  {_itemRoot?.title}
                </div>
              </div>

              <div className="flex h-full w-full divide-x divide-subtle">
                {_itemRoot.children &&
                  _itemRoot.children.length > 0 &&
                  _itemRoot.children.map((_item: any, _idx: any) => (
                    <div
                      key={`sub-title-${_idxRoot}-${_idx}`}
                      className="relative flex h-full flex-col overflow-hidden whitespace-nowrap"
                      style={{ width: `${currentViewData?.data.width}px` }}
                    >
                      <div
                        className={`flex-shrink-0 border-b py-1 text-center text-13 font-medium capitalize ${
                          _item?.today ? `border-danger-strong text-danger-primary` : `border-subtle-1`
                        }`}
                      >
                        <div>{_item.title}</div>
                      </div>
                      <div className={`relative flex h-full w-full flex-1 justify-center`}>
                        {_item?.today && <div className="absolute bottom-0 top-0 border border-danger-strong"> </div>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
});
