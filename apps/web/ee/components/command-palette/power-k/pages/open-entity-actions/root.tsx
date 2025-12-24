// types
import type { TPowerKOpenEntityActionsProps } from "@/components/power-k/ui/pages/open-entity/shared";
// local imports
import { PowerKOpenCustomersMenu } from "./customers-menu";
import { PowerKOpenInitiativesMenu } from "./initiatives-menu";
import { PowerKOpenTeamspacesMenu } from "./teamspaces-menu";

export function PowerKOpenEntityActionsExtended(props: TPowerKOpenEntityActionsProps) {
  const { activePage, handleSelection } = props;

  return (
    <>
      {activePage === "open-teamspace" && <PowerKOpenTeamspacesMenu handleSelect={handleSelection} />}
      {activePage === "open-initiative" && <PowerKOpenInitiativesMenu handleSelect={handleSelection} />}
      {activePage === "open-customer" && <PowerKOpenCustomersMenu handleSelect={handleSelection} />}
    </>
  );
}
