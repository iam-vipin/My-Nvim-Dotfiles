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

import type { LOGICAL_OPERATOR, TSupportedOperators, TFilterValue } from "../../../rich-filters";
import type { SingleOrArray } from "../../../utils";

export type TAutomationConditionFilterProperty =
  | "payload.data.assignee_ids"
  | "payload.data.created_by_id"
  | "payload.data.label_ids"
  | "payload.data.priority"
  | "payload.data.state_id"
  | "payload.data.type_id";

export type TAutomationConditionFilterData = {
  field: TAutomationConditionFilterProperty;
  operator: TSupportedOperators;
  value: SingleOrArray<TFilterValue>;
};

export type TAutomationConditionFilterAndGroup = {
  [LOGICAL_OPERATOR.AND]: TAutomationConditionFilterExpressionData[];
};

export type TAutomationConditionFilterOrGroup = {
  [LOGICAL_OPERATOR.OR]: TAutomationConditionFilterExpressionData[];
};

export type TAutomationConditionFilterNotGroup = {
  [LOGICAL_OPERATOR.NOT]: TAutomationConditionFilterExpressionData;
};

export type TAutomationConditionFilterGroup =
  | TAutomationConditionFilterAndGroup
  | TAutomationConditionFilterOrGroup
  | TAutomationConditionFilterNotGroup;

export type TAutomationConditionFilterExpressionData = TAutomationConditionFilterData | TAutomationConditionFilterGroup;

export type TAutomationConditionFilterExpression = TAutomationConditionFilterExpressionData | undefined;

export type TAutomationConditionNodeConfig = {
  filter_expression: TAutomationConditionFilterExpression;
};
