/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import * as React from "react";

import { EIconSize } from "@plane/constants";
import { BacklogGroupIcon } from "./backlog-group-icon";
import { CancelledGroupIcon } from "./cancelled-group-icon";
import { CompletedGroupIcon } from "./completed-group-icon";
import type { IStateGroupIcon } from "./helper";
import { STATE_GROUP_COLORS, STATE_GROUP_SIZES } from "./helper";
import { StartedGroupIcon } from "./started-group-icon";
import { UnstartedGroupIcon } from "./unstarted-group-icon";

const iconComponents = {
  backlog: BacklogGroupIcon,
  cancelled: CancelledGroupIcon,
  completed: CompletedGroupIcon,
  started: StartedGroupIcon,
  unstarted: UnstartedGroupIcon,
};

export function StateGroupIcon({
  className = "",
  color,
  stateGroup,
  size = EIconSize.SM,
  percentage,
}: IStateGroupIcon) {
  const StateIconComponent = iconComponents[stateGroup] || UnstartedGroupIcon;

  return (
    <StateIconComponent
      height={STATE_GROUP_SIZES[size]}
      width={STATE_GROUP_SIZES[size]}
      color={color ?? STATE_GROUP_COLORS[stateGroup]}
      className={`flex-shrink-0 ${className}`}
      percentage={percentage}
    />
  );
}
