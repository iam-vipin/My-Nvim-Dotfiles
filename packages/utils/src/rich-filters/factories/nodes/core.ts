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

import { v4 as uuidv4 } from "uuid";
// plane imports
import type {
  TFilterAndGroupNode,
  TFilterConditionNode,
  TFilterConditionPayload,
  TFilterExpression,
  TFilterProperty,
  TFilterValue,
} from "@plane/types";
import { FILTER_NODE_TYPE, LOGICAL_OPERATOR } from "@plane/types";

/**
 * Creates a condition node with a unique ID.
 * @param condition - The condition to create
 * @returns The created condition node
 */
export const createConditionNode = <P extends TFilterProperty, V extends TFilterValue>(
  condition: TFilterConditionPayload<P, V>
): TFilterConditionNode<P, V> => ({
  id: uuidv4(),
  type: FILTER_NODE_TYPE.CONDITION,
  ...condition,
});

/**
 * Creates an AND group node with a unique ID.
 * @param nodes - The nodes to add to the group
 * @returns The created AND group node
 */
export const createAndGroupNode = <P extends TFilterProperty>(
  nodes: TFilterExpression<P>[]
): TFilterAndGroupNode<P> => ({
  id: uuidv4(),
  type: FILTER_NODE_TYPE.GROUP,
  logicalOperator: LOGICAL_OPERATOR.AND,
  children: nodes,
});
