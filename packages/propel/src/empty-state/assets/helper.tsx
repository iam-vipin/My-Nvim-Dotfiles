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

export const ILLUSTRATION_COLOR_TOKEN_MAP = {
  fill: {
    primary: "var(--illustration-fill-primary)", // #FFFFFF
    secondary: "var(--illustration-fill-secondary)", // #F4F5F5
    tertiary: "var(--illustration-fill-tertiary)", // #eaebeb
    quaternary: "var(--illustration-fill-quaternary)", // #CFD2D3
  },
  stroke: {
    primary: "var(--illustration-stroke-primary)", //#CFD2D3
    secondary: "var(--illustration-stroke-secondary)", // #8A9093
    tertiary: "var(--illustration-stroke-tertiary)", // #1d1f20
  },
};

export type TIllustrationAssetProps = {
  className?: string;
};
