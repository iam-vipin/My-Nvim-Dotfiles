"use client";
import { observer } from "mobx-react";
import { CalendarDays } from "lucide-react";
// plane imports
import { getRandomLabelColor } from "@plane/constants";
import { EpicIcon, ProjectIcon } from "@plane/propel/icons";
import { getDate } from "@plane/utils";
// core components
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { MergedDateDisplay } from "@/components/dropdowns/merged-date";
// hooks
import { useMember } from "@/hooks/store/use-member";
// plane Web
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import type { TInitiative } from "@/plane-web/types/initiative";
// local components
import { InitiativeLabelDropdown } from "./labels/initiative-label-dropdown";
import { PropertyBlockWrapper } from "./property-block-wrapper";
import { InitiativeStateDropdown } from "./states/initiative-state-dropdown";

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
    initiative: { updateInitiative, getInitiativesLabels, createInitiativeLabel },
  } = useInitiatives();

  // derived values
  const startDate = getDate(initiative.start_date);
  const endDate = getDate(initiative.end_date);
  const initiativeLabels = getInitiativesLabels(workspaceSlug);

  const handleLabelChange = (labelIds: string[]) => {
    updateInitiative?.(workspaceSlug, initiative.id, { label_ids: labelIds });
  };

  const handleLeadChange = (leadId: string | null) => {
    if (updateInitiative) {
      updateInitiative(workspaceSlug, initiative.id, { lead: leadId });
    }
  };

  const createLabel = async (labelName: string) => {
    const createdLabel = await createInitiativeLabel(workspaceSlug, { name: labelName, color: getRandomLabelColor() });
    return createdLabel;
  };

  return (
    <div
      className={`relative flex flex-wrap ${isSidebarCollapsed ? "md:flex-grow md:flex-shrink-0" : "lg:flex-grow lg:flex-shrink-0"} items-center gap-2 whitespace-nowrap`}
      // Prevent click events from bubbling to parent initiative block.
      // This is necessary to avoid triggering parent click handlers (e.g., for closing or selecting the block)
      onClick={(e) => e.stopPropagation()}
    >
      {/* dates */}
      {startDate && endDate && (
        <PropertyBlockWrapper>
          <CalendarDays className="h-3 w-3 flex-shrink-0" />
          <MergedDateDisplay startDate={initiative.start_date} endDate={initiative.end_date} className="flex-grow" />
        </PropertyBlockWrapper>
      )}

      {/* projects */}
      {initiative.project_ids && initiative.project_ids.length > 0 && (
        <PropertyBlockWrapper>
          <ProjectIcon className="h-4 w-4" />
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
      {/*  lead */}
      <PropertyBlockWrapper>
        <MemberDropdown
          value={initiative.lead ?? null}
          onChange={handleLeadChange}
          multiple={false}
          buttonVariant="border-with-text"
          placeholder="Lead"
          showUserDetails
          optionsClassName="z-10"
        />
      </PropertyBlockWrapper>
      {/* state */}
      {initiative.state && (
        <PropertyBlockWrapper>
          <InitiativeStateDropdown
            value={initiative.state}
            placeholder="State"
            size="xs"
            onChange={(state) => updateInitiative?.(workspaceSlug, initiative.id, { state })}
          />
        </PropertyBlockWrapper>
      )}
      {/* labels */}
      <PropertyBlockWrapper>
        <InitiativeLabelDropdown
          value={initiative.label_ids || []}
          labels={initiativeLabels}
          onChange={handleLabelChange}
          onAddLabel={createLabel}
          placeholder=""
          size="xs"
        />
      </PropertyBlockWrapper>
    </div>
  );
});
