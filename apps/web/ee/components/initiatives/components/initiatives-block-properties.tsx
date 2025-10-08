"use client";
import { observer } from "mobx-react";
import { Briefcase, CalendarDays } from "lucide-react";
// plane imports
import { EpicIcon } from "@plane/propel/icons";
import { Avatar } from "@plane/ui";
import { getDate, getFileURL } from "@plane/utils";
// core components
import { MergedDateDisplay } from "@/components/dropdowns/merged-date";
// hooks
import { useMember } from "@/hooks/store/use-member";
// plane Web
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import { TInitiative } from "@/plane-web/types/initiative";
// local components
import { PropertyBlockWrapper } from "./property-block-wrapper";
import { InitiativesStatesDropdown } from "./states/dropdown";

type Props = {
  initiative: TInitiative;
  isSidebarCollapsed: boolean | undefined;
  workspaceSlug: string;
};

export const InitiativesBlockProperties = observer((props: Props) => {
  const { initiative, isSidebarCollapsed, workspaceSlug } = props;
  // store hooks
  const { getUserDetails } = useMember();
  const {
    initiative: { updateInitiative },
  } = useInitiatives();

  // derived values
  const lead = getUserDetails(initiative.lead ?? "");
  const startDate = getDate(initiative.start_date);
  const endDate = getDate(initiative.end_date);

  return (
    <div
      className={`relative flex flex-wrap ${isSidebarCollapsed ? "md:flex-grow md:flex-shrink-0" : "lg:flex-grow lg:flex-shrink-0"} items-center gap-2 whitespace-nowrap`}
    >
      {/* dates */}
      {startDate && endDate && (
        <PropertyBlockWrapper>
          <CalendarDays className="h-3 w-3 flex-shrink-0" />
          <MergedDateDisplay startDate={initiative.start_date} endDate={initiative.end_date} className="flex-grow" />
        </PropertyBlockWrapper>
      )}

      {/* state */}
      {initiative.state && (
        <PropertyBlockWrapper>
          <InitiativesStatesDropdown
            value={initiative.state}
            placeholder="State"
            buttonClassName="h-full"
            onChange={(state) => updateInitiative?.(workspaceSlug, initiative.id, { state })}
          />
        </PropertyBlockWrapper>
      )}

      {/*  lead */}
      {lead && (
        <PropertyBlockWrapper>
          <Avatar
            key={lead.id}
            name={lead.display_name}
            src={getFileURL(lead.avatar_url)}
            size={16}
            className="text-[9px]"
          />
          <div>{lead.first_name}</div>
        </PropertyBlockWrapper>
      )}

      {/* projects */}
      {initiative.project_ids && initiative.project_ids.length > 0 && (
        <PropertyBlockWrapper>
          <Briefcase className="h-4 w-4" />
          <span className="flex-grow truncate max-w-40">{initiative.project_ids.length}</span>
        </PropertyBlockWrapper>
      )}

      {/* epics */}
      {initiative.epic_ids && initiative.epic_ids.length > 0 && (
        <PropertyBlockWrapper>
          <EpicIcon className="h-4 w-4" />
          <span className="flex-grow truncate max-w-40">{initiative.epic_ids.length}</span>
        </PropertyBlockWrapper>
      )}
    </div>
  );
});
