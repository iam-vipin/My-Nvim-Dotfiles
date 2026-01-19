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

// plane sdk
import type { ExIssueProperty } from "@plane/sdk";
import { EIssuePropertyRelationType, EIssuePropertyType } from "@plane/sdk";
// silo core
import type { AsanaCustomFieldType } from "@/asana/types";
import { getTextPropertySettings } from "@/core";
// types

export const CUSTOM_FIELD_ATTRIBUTES: Record<AsanaCustomFieldType, Partial<ExIssueProperty>> = {
  text: {
    property_type: EIssuePropertyType.TEXT,
    relation_type: undefined,
    is_multi: false,
    settings: getTextPropertySettings("multi-line"),
  },
  number: {
    property_type: EIssuePropertyType.DECIMAL,
    relation_type: undefined,
    is_multi: false,
  },
  enum: {
    property_type: EIssuePropertyType.OPTION,
    relation_type: undefined,
    is_multi: false,
  },
  multi_enum: {
    property_type: EIssuePropertyType.OPTION,
    relation_type: undefined,
    is_multi: true,
  },
  date: {
    property_type: EIssuePropertyType.DATETIME,
    relation_type: undefined,
    is_multi: false,
  },
  people: {
    property_type: EIssuePropertyType.RELATION,
    relation_type: EIssuePropertyRelationType.USER,
    is_multi: true,
  },
};
