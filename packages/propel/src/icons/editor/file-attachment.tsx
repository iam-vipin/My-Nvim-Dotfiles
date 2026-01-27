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

import { IconWrapper } from "../icon-wrapper";
import type { ISvgIcons } from "../type";

export function FileAttachmentIcon({ color = "currentColor", ...rest }: ISvgIcons) {
  return (
    <IconWrapper color={color} {...rest}>
      <path
        d="M8.82042 1.90734C9.97567 0.752272 11.8488 0.752213 13.004 1.90734C14.1592 3.06257 14.1591 4.93561 13.004 6.09093L7.2296 11.8663C6.52993 12.566 5.39512 12.5659 4.69542 11.8663C3.99572 11.1666 3.99572 10.0318 4.69542 9.33214L9.7628 4.26476C10.0068 4.02072 10.4025 4.0208 10.6466 4.26476C10.8907 4.50883 10.8907 4.90447 10.6466 5.14855L5.57921 10.2159C5.36768 10.4275 5.36768 10.771 5.57921 10.9825C5.79072 11.194 6.13426 11.1941 6.34581 10.9825L12.1202 5.20714C12.7871 4.53998 12.7873 3.4582 12.1202 2.79112C11.4532 2.12416 10.3713 2.12422 9.70421 2.79112L3.69346 8.80187C2.57097 9.92454 2.57113 11.7445 3.69346 12.8673C4.81622 13.99 6.63708 13.99 7.75987 12.8673L13.7696 6.85753C14.0137 6.61351 14.4093 6.61361 14.6534 6.85753C14.8975 7.10161 14.8975 7.49724 14.6534 7.74132L8.64366 13.7521C7.03275 15.3628 4.42056 15.3628 2.80967 13.7521C1.19881 12.1412 1.1989 9.52903 2.80967 7.91808L8.82042 1.90734Z"
        fill={color}
      />
    </IconWrapper>
  );
}
