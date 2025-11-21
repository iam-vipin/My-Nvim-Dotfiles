"use client";

import { observer } from "mobx-react";
// plane imports
import { Spinner } from "@plane/ui";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import type { TInitiative } from "@/plane-web/types/initiative";
// local imports
import { PowerKInitiativesMenu } from "../../menus/initiatives";

type Props = {
  handleSelect: (initiative: TInitiative) => void;
};

export const PowerKOpenInitiativesMenu: React.FC<Props> = observer((props) => {
  const { handleSelect } = props;
  // store hooks
  const {
    initiative: { initiativesLoader, initiativeIds, getInitiativeById },
  } = useInitiatives();
  // derived values
  const initiativesList = initiativeIds
    ? initiativeIds.map((initiativeId) => getInitiativeById(initiativeId)).filter((initiative) => !!initiative)
    : [];

  if (initiativesLoader) return <Spinner />;

  return <PowerKInitiativesMenu initiatives={initiativesList} onSelect={handleSelect} />;
});
