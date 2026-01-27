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
import { CircleDotDashed, Circle } from "lucide-react";

import { CycleIcon } from "../project/cycle-icon";
import { CircleDotFullIcon } from "./circle-dot-full-icon";
import type { ICycleGroupIcon } from "./helper";
import { CYCLE_GROUP_COLORS } from "./helper";

const iconComponents = {
  current: CycleIcon,
  upcoming: CircleDotDashed,
  completed: CircleDotFullIcon,
  draft: Circle,
};

export function CycleGroupIcon({
  className = "",
  color,
  cycleGroup,
  height = "12px",
  width = "12px",
}: ICycleGroupIcon) {
  const CycleIconComponent = iconComponents[cycleGroup] || CycleIcon;

  return (
    <CycleIconComponent
      height={height}
      width={width}
      color={color ?? CYCLE_GROUP_COLORS[cycleGroup]}
      className={`flex-shrink-0 ${className}`}
    />
  );
}
