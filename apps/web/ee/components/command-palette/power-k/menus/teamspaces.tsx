"use client";

import React from "react";
import { observer } from "mobx-react";
// plane imports
import type { TTeamspace } from "@plane/types";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { PowerKMenuBuilder } from "@/components/power-k/menus/builder";

type Props = {
  teamspaces: TTeamspace[];
  onSelect: (teamspace: TTeamspace) => void;
};

export const PowerKTeamspacesMenu: React.FC<Props> = observer(({ teamspaces, onSelect }) => (
  <PowerKMenuBuilder
    heading="Teamspaces"
    items={teamspaces}
    getIconNode={(teamspace) => <Logo logo={teamspace.logo_props} size={14} />}
    getKey={(teamspace) => teamspace.id}
    getLabel={(teamspace) => teamspace.name}
    getValue={(teamspace) => teamspace.name}
    onSelect={onSelect}
    emptyText="No teamspaces found"
  />
));
