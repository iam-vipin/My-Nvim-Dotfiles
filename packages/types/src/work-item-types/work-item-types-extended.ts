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

import type { EIssuePropertyType, IIssueProperty } from "./work-item-properties";
import type { TIssuePropertyTypeKeys } from "./work-item-property-configurations";
import type { IIssueType } from "./work-item-types";

export type TIssuePropertySerializedValuePrimitive = string | number | boolean | null | undefined;
export type TIssuePropertySerializedValue =
  | TIssuePropertySerializedValuePrimitive
  | TIssuePropertySerializedValuePrimitive[];

export type TIssuePropertySerializedEntry = {
  property_id?: string;
  value?: TIssuePropertySerializedValue;
  [key: string]: TIssuePropertySerializedValue | undefined;
} | null;

export type TIssuePropertyDisplayEntry = {
  property: IIssueProperty<EIssuePropertyType>;
  propertyId: string;
  propertyTypeKey: TIssuePropertyTypeKeys;
  displayValues: string[];
};

export type TIssuePropertyDisplayContext = {
  entries: TIssuePropertySerializedEntry[];
  workItemType?: IIssueType;
};
