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

import type { TFilterValue } from "../expression";

/**
 * Negative operator configuration for operators.
 * - allowNegative: Whether the operator supports negation
 * - negOperatorLabel: Label to use when the operator is negated
 */
export type TNegativeOperatorConfig = { allowNegative: true; negOperatorLabel?: string } | { allowNegative?: false };

/**
 * Base filter configuration shared by all filter types.
 * - operatorLabel: Label to use for the operator
 * - negativeOperatorConfig: Configuration for negative operators
 */
export type TBaseFilterFieldConfig = {
  isOperatorEnabled?: boolean;
  operatorLabel?: string;
} & TNegativeOperatorConfig;

/**
 * Individual option for select/multi-select filters.
 * - id: Unique identifier for the option
 * - label: Display text shown to users
 * - value: Actual value used in filtering
 * - icon: Optional icon component
 * - iconClassName: CSS class for icon styling
 * - disabled: Whether option can be selected
 * - description: Additional context to be displayed in the filter dropdown
 */
export interface IFilterOption<V extends TFilterValue> {
  id: string;
  label: string;
  value: V;
  icon?: React.ReactNode;
  iconClassName?: string;
  disabled?: boolean;
  description?: string;
}
