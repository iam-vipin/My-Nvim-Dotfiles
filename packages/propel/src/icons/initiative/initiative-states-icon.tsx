import * as React from "react";

import { EIconSize, INITIATIVE_STATES } from "@plane/constants";
import type { TInitiativeStates } from "@plane/types";

import { ActiveIcon } from "./active-icon";
import { ClosedIcon } from "./closed-icon";
import { CompletedIcon } from "./completed-icon";
import { DraftsIcon } from "./drafts-icon";
import { PlannedIcon } from "./planned-icon";

export interface IInitiativeStateIcon {
  className?: string;
  color?: string;
  state: TInitiativeStates;
  size?: EIconSize;
  percentage?: number;
}

const iconComponents: Record<TInitiativeStates, React.ComponentType<IInitiativeStateIcon>> = {
  DRAFT: DraftsIcon,
  PLANNED: PlannedIcon,
  ACTIVE: ActiveIcon,
  COMPLETED: CompletedIcon,
  CLOSED: ClosedIcon,
};

export const INITIATIVE_STATES_SIZES: {
  [key in EIconSize]: string;
} = {
  [EIconSize.XS]: "10px",
  [EIconSize.SM]: "12px",
  [EIconSize.MD]: "14px",
  [EIconSize.LG]: "16px",
  [EIconSize.XL]: "18px",
};

export const InitiativeStateIcon: React.FC<IInitiativeStateIcon> = ({
  color,
  state,
  size = EIconSize.SM,
  percentage,
}) => {
  const InitiativeIconComponent = iconComponents[state] || DraftsIcon;

  return (
    <InitiativeIconComponent
      state={state}
      size={size}
      color={color ?? INITIATIVE_STATES[state].color}
      className={"flex-shrink-0"}
      percentage={percentage}
    />
  );
};
