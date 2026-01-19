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
import type { TFilterExpression, TFilterProperty } from "@plane/types";
// local imports
import { isNotGroupNode } from "../../types/extended";
import { findImmediateParent } from "./core";

/**
 * Checks if a condition is directly wrapped in a NOT group.
 * @param expression - The filter expression to check in
 * @param conditionId - The ID of the condition to check
 * @returns True if the condition is directly wrapped in a NOT group, false otherwise
 */
export const isDirectlyWrappedInNotGroup = <P extends TFilterProperty>(
  expression: TFilterExpression<P> | null,
  conditionId: string
): boolean => {
  if (!expression) return false;
  const immediateParent = findImmediateParent(expression, conditionId);
  return immediateParent !== null && isNotGroupNode(immediateParent);
};
