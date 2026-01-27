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

import type { ISvgIcons } from "../type";

export function DraftsIcon({ className = "", color = "#60646C", height = "16", width = "16", ...rest }: ISvgIcons) {
  return (
    <svg
      height={height}
      width={width}
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M4.51823 12.88C4.59249 13.1165 4.8053 13.2773 5.04557 13.2775H6.73405V15.0001H5.04557L4.86686 14.9923C3.97966 14.9185 3.21295 14.3003 2.93424 13.4132L2.41178 11.7521L3.99674 11.2199L4.51823 12.88Z"
        fill={color}
      />
      <path
        d="M13.5876 11.7521L13.0661 13.4132C12.7688 14.3595 11.9155 15.0001 10.9538 15.0001H9.26628V13.2775H10.9538C11.1942 13.2775 11.4078 13.1166 11.4821 12.88L12.0036 11.2199L13.5876 11.7521Z"
        fill={color}
      />
      <path
        d="M3.77018 4.70131L4.25944 5.39857L2.89323 6.42494C2.6991 6.57107 2.61716 6.83025 2.69108 7.06654L3.21354 8.72865L1.63053 9.25892L1.10905 7.59877C0.811989 6.65249 1.13765 5.61523 1.91569 5.03041L3.27995 4.00502L3.77018 4.70131Z"
        fill={color}
      />
      <path
        d="M14.0846 5.03041C14.8626 5.61521 15.1883 6.65251 14.8913 7.59877L14.3688 9.25892L12.7858 8.72865L13.3083 7.06654C13.3822 6.8303 13.3011 6.5711 13.1071 6.42494L11.7409 5.39857L12.7184 4.00502L14.0846 5.03041Z"
        fill={color}
      />
      <path
        d="M6.69499 1.43861C7.47309 0.853829 8.52727 0.853763 9.30534 1.43861L10.6696 2.46498L9.69206 3.85853L8.32585 2.83119C8.13142 2.68544 7.86782 2.68523 7.6735 2.83119L6.30827 3.85853L5.32878 2.46498L6.69499 1.43861Z"
        fill={color}
      />
    </svg>
  );
}
