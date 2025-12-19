import { observer } from "mobx-react";
import { STATE_GROUPS } from "@plane/constants";
import { ChevronDownIcon } from "@plane/propel/icons";
// plane imports
import type { TStateGroups } from "@plane/types";
import { MultiSelectDropdown } from "@plane/ui";
import { cn } from "@plane/utils";
// plane web imports
import type { TStatisticsFilterProps } from "@/plane-web/types/teamspace";

export const StatisticsStateGroupFilter = observer(function StatisticsStateGroupFilter(
  props: TStatisticsFilterProps<"state_group">
) {
  const { value, isLoading, buttonContainerClassName, chevronClassName, handleFilterChange } = props;
  // derived values
  const options = Object.values(STATE_GROUPS).map((stateGroup) => ({
    data: stateGroup.key,
    value: stateGroup.label,
  }));

  return (
    <MultiSelectDropdown
      value={value}
      options={options}
      onChange={(value) => handleFilterChange(value as TStateGroups[])}
      keyExtractor={(option) => option.data}
      buttonContainerClassName={buttonContainerClassName}
      buttonContent={(isOpen, val) => (
        <span className="flex items-center gap-1">
          {val && val.length > 0 ? `${val.length} group selected` : "State group"}
          <ChevronDownIcon className={cn(chevronClassName, isOpen ? "rotate-180" : "rotate-0")} />
        </span>
      )}
      disableSearch
      disabled={isLoading}
    />
  );
});
