import { observer } from "mobx-react";
import { FiltersToggle } from "@/components/rich-filters/filters-toggle";
import { useInitiativesFilterContext } from "./context";

export const InitiativesFiltersToggle = observer(function InitiativesFiltersToggle() {
  const { filterInstance } = useInitiativesFilterContext();

  return <FiltersToggle filter={filterInstance ?? undefined} />;
});
