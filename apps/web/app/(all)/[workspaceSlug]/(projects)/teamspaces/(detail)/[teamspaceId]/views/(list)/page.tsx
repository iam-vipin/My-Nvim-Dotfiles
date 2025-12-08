import { useCallback } from "react";
import { observer } from "mobx-react";
// plane imports
import type { EViewAccess, TViewFilterProps } from "@plane/types";
import { calculateTotalFilters } from "@plane/utils";
// constants
import { ViewAppliedFiltersList } from "@/components/views/applied-filters";
// plane web imports
import { TeamspaceViewsList } from "@/plane-web/components/teamspaces/views/views-list";
import { useTeamspaceViews } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function TeamspaceViewsPage({ params }: Route.ComponentProps) {
  const { teamspaceId } = params;
  // store hooks
  const { getTeamspaceViewsFilters, updateFilters, clearAllFilters } = useTeamspaceViews();
  // derived values
  const teamspaceViewsFilters = getTeamspaceViewsFilters(teamspaceId);
  const isFiltersApplied = calculateTotalFilters(teamspaceViewsFilters?.filters ?? {}) !== 0;

  // handlers
  const handleRemoveFilter = useCallback(
    (key: keyof TViewFilterProps, value: string | EViewAccess | null) => {
      let newValues = teamspaceViewsFilters?.filters?.[key];

      if (key === "favorites") {
        newValues = !!value;
      }
      if (Array.isArray(newValues)) {
        if (!value) newValues = [];
        else newValues = newValues.filter((val) => val !== value) as string[];
      }

      updateFilters(teamspaceId, "filters", {
        ...teamspaceViewsFilters?.filters,
        [key]: newValues,
      });
    },
    [teamspaceId, teamspaceViewsFilters?.filters, updateFilters]
  );

  return (
    <div className="flex flex-col w-full h-full">
      {isFiltersApplied && (
        <div className="w-full px-6 py-3 border-b border-custom-border-200">
          <ViewAppliedFiltersList
            appliedFilters={teamspaceViewsFilters?.filters ?? {}}
            handleClearAllFilters={() => clearAllFilters(teamspaceId)}
            handleRemoveFilter={handleRemoveFilter}
            alwaysAllowEditing
          />
        </div>
      )}
      <div className="h-full w-full overflow-hidden overflow-y-auto">
        <TeamspaceViewsList teamspaceId={teamspaceId} />
      </div>
    </div>
  );
}

export default observer(TeamspaceViewsPage);
