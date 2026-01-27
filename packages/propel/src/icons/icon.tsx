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

import type { IconName } from "./registry";
import { ICON_REGISTRY } from "./registry";
import type { ISvgIcons } from "./type";

export interface IconProps extends Omit<ISvgIcons, "ref"> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = ICON_REGISTRY[name] || ICON_REGISTRY.default;
  return <IconComponent {...props} />;
}
