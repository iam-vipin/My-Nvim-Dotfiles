import { observer } from "mobx-react";
import { Loader } from "@plane/ui";
import { FiltersRow } from "@/components/rich-filters/filters-row";
import { useInitiativesFilterContext } from "./context";

const InitiativesFiltersRow = observer(() => {
  const { filterInstance, isReady } = useInitiativesFilterContext();

  if (!isReady || !filterInstance) {
    return (
      <div className="px-page-x @container flex flex-wrap justify-between py-2 border-b border-custom-border-200 gap-2 bg-custom-background-100 z-[12]">
        <Loader.Item height="24px" width="100%" />
      </div>
    );
  }

  return (
    <FiltersRow
      filter={filterInstance}
      buttonConfig={{
        variant: "neutral-primary",
        label: "Filters",
        defaultOpen: false,
        className: "bg-custom-background-100",
      }}
    />
  );
});

export default InitiativesFiltersRow;
