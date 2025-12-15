import { observer } from "mobx-react";
import type { IFilterInstance } from "@plane/shared-state";
import type { TExternalDashboardWidgetFilterExpression, TDashboardWidgetFilterKeys } from "@plane/types";
import { FilterItem } from "@/components/rich-filters/filter-item/root";

type Props = {
  filters: IFilterInstance<TDashboardWidgetFilterKeys, TExternalDashboardWidgetFilterExpression>;
};

export const FilterConditions = observer(function FilterConditions({ filters }: Props) {
  return (
    <div className="flex flex-col items-start">
      {filters.allConditionsForDisplay.map((condition, index) => (
        <div key={condition.id} className="flex flex-col items-start">
          <FilterItem filter={filters} condition={condition} showTransition={false} />

          {index < filters.allConditionsForDisplay.length - 1 && (
            <div className="flex flex-col items-center">
              <div className="h-2 border-l border-dashed border-strong" />
              <span className="text-11 font-medium uppercase text-secondary px-2 py-0.5 bg-layer-2 rounded-sm">
                And
              </span>
              <div className="h-2 border-l border-dashed border-strong" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
