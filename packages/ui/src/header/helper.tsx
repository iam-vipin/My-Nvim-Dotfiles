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

export enum EHeaderVariant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  TERNARY = "ternary",
}
export type THeaderVariant = EHeaderVariant.PRIMARY | EHeaderVariant.SECONDARY | EHeaderVariant.TERNARY;

export interface IHeaderProperties {
  [key: string]: string;
}
export const headerStyle: IHeaderProperties = {
  [EHeaderVariant.PRIMARY]:
    "relative flex w-full flex-shrink-0 flex-row items-center justify-between gap-x-2 gap-y-4 bg-surface-1 bg-surface-1 z-[18]",
  [EHeaderVariant.SECONDARY]: "!py-0  overflow-y-hidden border-b border-subtle justify-between bg-surface-1 z-[15]",
  [EHeaderVariant.TERNARY]: "flex flex-wrap justify-between py-2  border-b border-subtle gap-2 bg-surface-1 z-[12]",
};
export const minHeights: IHeaderProperties = {
  [EHeaderVariant.PRIMARY]: "",
  [EHeaderVariant.SECONDARY]: "min-h-[52px]",
  [EHeaderVariant.TERNARY]: "",
};
export const getHeaderStyle = (variant: THeaderVariant, setMinHeight: boolean, showOnMobile: boolean) => {
  const height = setMinHeight ? minHeights[variant] : "";
  const display = variant === EHeaderVariant.SECONDARY ? (showOnMobile ? "flex" : "hidden md:flex") : "";
  return " @container " + headerStyle[variant] + " " + height + " " + display;
};
