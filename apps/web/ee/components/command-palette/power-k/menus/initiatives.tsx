"use client";

import React from "react";
import { observer } from "mobx-react";
// plane imports
import { Logo } from "@plane/propel/emoji-icon-picker";
import { InitiativeIcon } from "@plane/propel/icons";
// components
import { PowerKMenuBuilder } from "@/components/power-k/menus/builder";
// plane web imports
import type { TInitiative } from "@/plane-web/types/initiative";

type Props = {
  initiatives: TInitiative[];
  onSelect: (initiative: TInitiative) => void;
};

export const PowerKInitiativesMenu: React.FC<Props> = observer(({ initiatives, onSelect }) => (
  <PowerKMenuBuilder
    heading="Initiatives"
    items={initiatives}
    getIconNode={(initiative) => (
      <>
        {initiative?.logo_props?.in_use ? (
          <Logo logo={initiative?.logo_props} size={14} type="lucide" />
        ) : (
          <InitiativeIcon className="size-3.5 text-custom-text-300" />
        )}
      </>
    )}
    getKey={(initiative) => initiative.id}
    getLabel={(initiative) => initiative.name}
    getValue={(initiative) => initiative.name}
    onSelect={onSelect}
    emptyText="No initiatives found"
  />
));
