import { observer } from "mobx-react";
// plane imports
import type { TTeamspace } from "@plane/types";
import { Spinner } from "@plane/ui";
// plane-web imports
import { useTeamspaces } from "@/plane-web/hooks/store";
// local imports
import { PowerKTeamspacesMenu } from "../../menus/teamspaces";

type Props = {
  handleSelect: (teamspace: TTeamspace) => void;
};

export const PowerKOpenTeamspacesMenu = observer(function PowerKOpenTeamspacesMenu(props: Props) {
  const { handleSelect } = props;
  // store hooks
  const { loader, joinedTeamSpaceIds, getTeamspaceById } = useTeamspaces();
  // derived values
  const teamspacesList = joinedTeamSpaceIds
    ? joinedTeamSpaceIds.map((teamspaceId) => getTeamspaceById(teamspaceId)).filter((teamspace) => !!teamspace)
    : [];

  if (loader === "init-loader") return <Spinner />;

  return <PowerKTeamspacesMenu teamspaces={teamspacesList} onSelect={handleSelect} />;
});
