import type { FC } from "react";
import { observer } from "mobx-react";
// hooks
import { useGanttChart } from "../..";

export const WeekChartView = observer(function WeekChartView(_props: any) {
  const { currentViewData, renderView } = useGanttChart();

  return (
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
                        _item?.today ? `border-red-500 text-red-500` : `border-subtle-1`
                      }`}
                    >
                      <div>{_item.title}</div>
                    </div>
                    <div
                      className={`relative flex h-full w-full flex-1 justify-center ${
                        ["sat", "sun"].includes(_item?.dayData?.shortTitle || "") ? `bg-layer-1` : ``
                      }`}
                    >
                      {_item?.today && <div className="absolute bottom-0 top-0 border border-red-500"> </div>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
});
