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

export const CHARTS_THEME = {
  background: "transparent",
  text: {
    color: "var(--text-color-secondary)",
  },
  axis: {
    domain: {
      line: {
        stroke: "var(--background-color-layer-2)",
        strokeWidth: 0.5,
      },
    },
  },
  tooltip: {
    container: {
      background: "var(--background-color-layer-2)",
      color: "var(--text-color-secondary)",
      fontSize: "0.8rem",
      border: "1px solid var(--border-color-strong)",
    },
  },
  grid: {
    line: {
      stroke: "var(--border-color-subtle)",
    },
  },
};

export const CHART_DEFAULT_MARGIN = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50,
};
