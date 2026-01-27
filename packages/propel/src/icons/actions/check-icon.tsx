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

export const CheckIcon: React.FC<ISvgIcons> = ({ color = "currentColor", ...rest }) => (
  <IconWrapper color={color} {...rest}>
    <path
      d="M12.9746 3.78242C13.2185 3.53862 13.6143 3.53873 13.8584 3.78242C14.1024 4.0265 14.1024 4.42311 13.8584 4.66719L6.52534 12.0002C6.28132 12.2442 5.88565 12.2441 5.64155 12.0002L2.30757 8.66719C2.06349 8.42311 2.06349 8.0265 2.30757 7.78242C2.55165 7.53835 2.94826 7.53835 3.19234 7.78242L6.08296 10.674L12.9746 3.78242Z"
      fill={color}
    />
  </IconWrapper>
);
