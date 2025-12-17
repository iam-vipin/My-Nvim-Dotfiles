import React from "react";
import { observer } from "mobx-react";
// components
import type { TInitiativeDisplayFilters } from "@plane/types";
import { INITIATIVE_GROUP_BY_OPTIONS, INITIATIVE_ORDER_BY_OPTIONS } from "@/plane-web/constants/initiative";
import { FilterGroupBy, FilterOrderBy } from "./";
// Plane-web

type Props = {
  displayFilters: TInitiativeDisplayFilters | undefined;
  handleDisplayFiltersUpdate: (updatedDisplayFilter: Partial<TInitiativeDisplayFilters>) => void;
};

export const DisplayFiltersSelection = observer(function DisplayFiltersSelection(props: Props) {
  const { displayFilters, handleDisplayFiltersUpdate } = props;

  const isDisplayFilterEnabled = (displayFilter: keyof TInitiativeDisplayFilters) => {
    if (displayFilter === "group_by" && displayFilters?.layout === "gantt") {
      return false;
    }
    return true;
  };

  return (
    <div className="vertical-scrollbar scrollbar-sm relative h-full w-full divide-y divide-subtle overflow-hidden overflow-y-auto px-2.5">
      {/* group by */}
      {isDisplayFilterEnabled("group_by") && (
        <div className="py-2">
          <FilterGroupBy
            displayFilters={displayFilters}
            groupByOptions={INITIATIVE_GROUP_BY_OPTIONS.map((option) => option.key)}
            handleUpdate={(val) =>
              handleDisplayFiltersUpdate({
                group_by: val,
              })
            }
          />
        </div>
      )}

      {/* order by */}
      {isDisplayFilterEnabled("order_by") && (
        <div className="py-2">
          <FilterOrderBy
            selectedOrderBy={displayFilters?.order_by}
            handleUpdate={(val) =>
              handleDisplayFiltersUpdate({
                order_by: val,
              })
            }
            orderByOptions={INITIATIVE_ORDER_BY_OPTIONS.map((option) => option.key)}
          />
        </div>
      )}
    </div>
  );
});
