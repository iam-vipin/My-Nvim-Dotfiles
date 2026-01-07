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

// plane imports
import type {
  TAllAvailableOperatorsForDisplay,
  TFilterExpression,
  TFilterProperty,
  TSupportedOperators,
} from "@plane/types";
// local imports
import { toNegativeOperator } from "../../operators/extended";
import { isNotGroupNode } from "../../types/extended";
import { findImmediateParent } from "./core";

/**
 * Helper function to get the display operator for a condition.
 * This checks for NOT group context and applies negation if needed.
 * @param operator - The original operator
 * @param expression - The filter expression
 * @param conditionId - The ID of the condition
 * @returns The display operator (possibly negated)
 */
export const getDisplayOperator = <P extends TFilterProperty>(
  operator: TSupportedOperators,
  expression: TFilterExpression<P>,
  conditionId: string
): TAllAvailableOperatorsForDisplay => {
  const immediateParent = findImmediateParent(expression, conditionId);

  // If immediate parent is a NOT group, transform the operator
  if (immediateParent && isNotGroupNode(immediateParent)) {
    return toNegativeOperator(operator);
  }

  // Otherwise, return the operator as-is
  return operator;
};
