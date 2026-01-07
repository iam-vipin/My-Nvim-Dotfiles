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

// types
export type TPlacement =
  | "auto"
  | "auto-start"
  | "auto-end"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end"
  | "top"
  | "bottom"
  | "right"
  | "left";

export type TSide = "top" | "bottom" | "left" | "right";
export type TAlign = "start" | "center" | "end";

// placement conversion map
const PLACEMENT_MAP = new Map<TPlacement, { side: TSide; align: TAlign }>([
  ["auto", { side: "bottom", align: "center" }],
  ["auto-start", { side: "bottom", align: "start" }],
  ["auto-end", { side: "bottom", align: "end" }],
  ["top", { side: "top", align: "center" }],
  ["bottom", { side: "bottom", align: "center" }],
  ["left", { side: "left", align: "center" }],
  ["right", { side: "right", align: "center" }],
  ["top-start", { side: "top", align: "start" }],
  ["top-end", { side: "top", align: "end" }],
  ["bottom-start", { side: "bottom", align: "start" }],
  ["bottom-end", { side: "bottom", align: "end" }],
  ["left-start", { side: "left", align: "start" }],
  ["left-end", { side: "left", align: "end" }],
  ["right-start", { side: "right", align: "start" }],
  ["right-end", { side: "right", align: "end" }],
]);

// conversion function
export function convertPlacementToSideAndAlign(placement: TPlacement): {
  side: TSide;
  align: TAlign;
} {
  return PLACEMENT_MAP.get(placement) || { side: "bottom", align: "center" };
}
