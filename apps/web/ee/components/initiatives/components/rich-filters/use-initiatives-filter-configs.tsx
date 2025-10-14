import { useMemo } from "react";
import { CalendarCheck2, CalendarClock, Users } from "lucide-react";
import { INITIATIVE_STATES } from "@plane/constants";
import { InitiativeStateIcon } from "@plane/propel/icons";
import type { IUserLite } from "@plane/types";
import { Avatar } from "@plane/ui";
import {
  getInitiativeLeadFilterConfig,
  getInitiativeStartDateFilterConfig,
  getInitiativeEndDateFilterConfig,
  getInitiativeStatesFilterConfig,
} from "@plane/utils";
import type { TFiltersOperatorConfigs } from "@/ce/hooks/rich-filters/use-filters-operator-configs";

interface UseInitiativesFilterConfigsProps {
  workspaceMembers: IUserLite[];
  operatorConfigs: TFiltersOperatorConfigs;
}

export const useInitiativesFilterConfigs = ({
  workspaceMembers,
  operatorConfigs,
}: UseInitiativesFilterConfigsProps) => {
  const leadFilterConfig = useMemo(
    () =>
      getInitiativeLeadFilterConfig("lead")({
        isEnabled: true,
        filterIcon: Users,
        members: workspaceMembers,
        getOptionIcon: (member: IUserLite) => <Avatar src={member.avatar_url} name={member.display_name} size="sm" />,
        ...operatorConfigs,
      }),
    [workspaceMembers, operatorConfigs]
  );

  const startDateFilterConfig = useMemo(
    () =>
      getInitiativeStartDateFilterConfig("start_date")({
        isEnabled: true,
        filterIcon: CalendarClock,
        ...operatorConfigs,
      }),
    [operatorConfigs]
  );

  const endDateFilterConfig = useMemo(
    () =>
      getInitiativeEndDateFilterConfig("end_date")({
        isEnabled: true,
        filterIcon: CalendarCheck2,
        ...operatorConfigs,
      }),
    [operatorConfigs]
  );

  const statesFilterConfig = useMemo(
    () =>
      getInitiativeStatesFilterConfig("state")({
        isEnabled: true,
        filterIcon: () => <InitiativeStateIcon state="DRAFT" />,
        items: Object.values(INITIATIVE_STATES).map((state) => ({
          key: state.key,
          title: state.title,
          icon: () => <InitiativeStateIcon state={state.key} />,
        })),
        getOptionIcon: (state) => <InitiativeStateIcon state={state} />,
        ...operatorConfigs,
      }),
    [operatorConfigs]
  );
  return {
    leadFilterConfig,
    startDateFilterConfig,
    endDateFilterConfig,
    statesFilterConfig,
  };
};
