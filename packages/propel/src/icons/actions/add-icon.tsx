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

export function AddIcon({ color = "currentColor", ...rest }: ISvgIcons) {
  const clipPathId = React.useId();

  return (
    <IconWrapper color={color} clipPathId={clipPathId} {...rest}>
      <path
        d="M7.37549 12.666V8.625H3.3335C2.98843 8.625 2.70867 8.34503 2.7085 8C2.7085 7.65482 2.98832 7.375 3.3335 7.375H7.37549V3.33301C7.37549 2.98783 7.65531 2.70801 8.00049 2.70801C8.34552 2.70818 8.62549 2.98794 8.62549 3.33301V7.375H12.6665C13.0117 7.375 13.2915 7.65482 13.2915 8C13.2913 8.34503 13.0116 8.625 12.6665 8.625H8.62549V12.666C8.62549 13.0111 8.34552 13.2908 8.00049 13.291C7.65531 13.291 7.37549 13.0112 7.37549 12.666Z"
        fill={color}
      />
    </IconWrapper>
  );
}
