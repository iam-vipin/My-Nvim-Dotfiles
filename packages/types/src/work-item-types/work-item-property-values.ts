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

// property value variant
export type TPropertyValueVariant = "create" | "update";

export type TIssuePropertyValues = {
  [property_id: string]: string[];
};

export type IssuePropertyValueError = {
  REQUIRED: "REQUIRED";
  INVALID: "INVALID";
};

export type EIssuePropertyValueError = keyof IssuePropertyValueError;

export type TIssuePropertyValueErrors = {
  [property_id: string]: EIssuePropertyValueError;
};
