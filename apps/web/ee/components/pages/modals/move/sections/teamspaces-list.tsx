import { useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// components
import { Logo } from "@plane/propel/emoji-icon-picker";
// plane web imports
import { useTeamspaces } from "@/plane-web/hooks/store";
// local imports
import { MovePageModalListSection } from "../list-section";
import type { TMovePageSelectedValue } from "../root";

type Props = {
  searchTerm: string;
};

export const MovePageModalTeamspacesListSection: React.FC<Props> = observer((props) => {
  const { searchTerm } = props;
  // navigation
  const { teamspaceId } = useParams();
  // store hooks
  const { getTeamspaceById, joinedTeamSpaceIds } = useTeamspaces();
  // derived values
  const currentTeamspace = teamspaceId ? getTeamspaceById(teamspaceId.toString()) : null;
  const transferrableTeamspaceIds = useMemo(
    () => joinedTeamSpaceIds.filter((id) => id !== currentTeamspace?.id),
    [currentTeamspace, joinedTeamSpaceIds]
  );
  const filteredTeamspaceIds = useMemo(
    () =>
      transferrableTeamspaceIds.filter((id) => {
        const teamspaceDetails = getTeamspaceById(id);
        const teamspaceQuery = `${teamspaceDetails?.name}`.toLowerCase();
        return teamspaceQuery.includes(searchTerm.toLowerCase());
      }),
    [getTeamspaceById, searchTerm, transferrableTeamspaceIds]
  );

  if (filteredTeamspaceIds.length === 0) return null;

  return (
    <MovePageModalListSection
      title="TEAMSPACES"
      items={filteredTeamspaceIds}
      getItemDetails={(id) => {
        const teamspaceDetails = getTeamspaceById(id);
        if (!teamspaceDetails) return null;
        return {
          logo: <Logo logo={teamspaceDetails.logo_props} size={16} />,
          name: teamspaceDetails.name,
          value: `teamspace-${id}` satisfies TMovePageSelectedValue,
        };
      }}
    />
  );
});
