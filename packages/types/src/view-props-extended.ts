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

import type { TCustomPropertyFilterKey } from "./work-item-types";

export interface IExtendedIssueDisplayProperties {
  customer_request_count?: boolean;
  customer_count?: boolean;
}

export type TExtendedIssueOrderByOptions =
  | "customer_request_count"
  | "-customer_request_count"
  | "customer_count"
  | "-customer_count";

export const WORK_ITEM_FILTER_PROPERTY_KEYS_EXTENDED = ["team_project_id", "type_id", "name", "milestone_id"] as const;

export type TExtendedWorkItemFilterProperty = TCustomPropertyFilterKey;

export type TExtendedIssueGroupByOptions = "milestone";
