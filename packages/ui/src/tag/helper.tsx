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

export enum ETagVariant {
  OUTLINED = "outlined",
}
export enum ETagSize {
  SM = "sm",
  LG = "lg",
}
export type TTagVariant = ETagVariant.OUTLINED;

export type TTagSize = ETagSize.SM | ETagSize.LG;
export interface ITagProperties {
  [key: string]: string;
}

export const containerStyle: ITagProperties = {
  [ETagVariant.OUTLINED]:
    "flex items-center rounded-md border border-subtle text-11 text-tertiary hover:text-secondary min-h-[36px] my-auto capitalize flex-wrap cursor-pointer gap-1.5",
};
export const sizes = {
  [ETagSize.SM]: "p-1.5",
  [ETagSize.LG]: "p-6",
};

export const getTagStyle = (variant: TTagVariant, size: TTagSize) => containerStyle[variant] + " " + sizes[size];
