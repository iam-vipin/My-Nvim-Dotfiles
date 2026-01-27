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

import { IconWrapper } from "../icon-wrapper";
import type { ISvgIcons } from "../type";

export function ChevronLeftIcon({ color = "currentColor", ...rest }: ISvgIcons) {
  return (
    <IconWrapper color={color} clipPathId="clip0_2890_23" {...rest}>
      <path
        d="M9.55757 3.55708C9.80165 3.313 10.1983 3.313 10.4423 3.55708C10.6864 3.80116 10.6864 4.19777 10.4423 4.44185L6.88472 7.99946L10.4423 11.5571C10.6864 11.8012 10.6864 12.1978 10.4423 12.4418C10.1983 12.6859 9.80165 12.6859 9.55757 12.4418L5.55757 8.44185C5.31349 8.19777 5.31349 7.80116 5.55757 7.55708L9.55757 3.55708Z"
        fill={color}
      />
    </IconWrapper>
  );
}
