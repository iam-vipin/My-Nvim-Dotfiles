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

import type { ISvgIcons } from "./type";

interface IIconWrapper extends ISvgIcons {
  children: React.ReactNode;
  clipPathId?: string;
  viewBox?: string;
}

export function IconWrapper({
  width = "16",
  height = "16",
  className = "text-current",
  children,
  clipPathId,
  viewBox = "0 0 16 16",
  ...rest
}: IIconWrapper) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      {clipPathId ? (
        <>
          <g clipPath={`url(#${clipPathId})`}>{children}</g>
          <defs>
            <clipPath id={clipPathId}>
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </>
      ) : (
        children
      )}
    </svg>
  );
}
