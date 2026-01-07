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

// local imports
import type {
  TAutomationActionNodeConfig,
  TAutomationNodeConfig,
  TAutomationConditionNodeConfig,
  TAutomationTriggerNodeConfig,
} from "./configs";
import type {
  TActionNodeHandlerName,
  TAutomationNodeHandlerName,
  TConditionNodeHandlerName,
  TTriggerNodeHandlerName,
} from "./handlers";

// --------- Base node ---------

export enum EAutomationNodeType {
  TRIGGER = "trigger",
  ACTION = "action",
  CONDITION = "condition",
}

export type TAutomationNode<
  T extends EAutomationNodeType = EAutomationNodeType,
  H extends TAutomationNodeHandlerName = TAutomationNodeHandlerName,
  C extends TAutomationNodeConfig = TAutomationNodeConfig,
> = {
  config: C;
  created_at: Date;
  created_by: string;
  handler_name: H;
  id: string;
  is_enabled: boolean;
  name: string;
  node_type: T;
  project: string;
  updated_at: Date;
  updated_by: string;
  workspace: string;
};

// --------- Action node ---------

export type TAutomationActionNode = TAutomationNode<
  EAutomationNodeType.ACTION,
  TActionNodeHandlerName,
  TAutomationActionNodeConfig
>;

export type TCreateActionPayload = Pick<TAutomationActionNode, "handler_name" | "config"> &
  Partial<TAutomationActionNode>;

// --------- Condition node ---------

export type TAutomationConditionNode = TAutomationNode<
  EAutomationNodeType.CONDITION,
  TConditionNodeHandlerName,
  TAutomationConditionNodeConfig
>;

export type TCreateConditionPayload = Pick<TAutomationConditionNode, "handler_name" | "config"> &
  Partial<TAutomationConditionNode>;

// --------- Trigger node ---------

export type TAutomationTriggerNode = TAutomationNode<
  EAutomationNodeType.TRIGGER,
  TTriggerNodeHandlerName,
  TAutomationTriggerNodeConfig
>;

export type TCreateTriggerPayload = Pick<TAutomationTriggerNode, "handler_name"> &
  Partial<TAutomationTriggerNode> & {
    conditionPayload?: Partial<TCreateConditionPayload>;
  };

export type TCreateTriggerResponse = {
  trigger: TAutomationTriggerNode;
  condition: TAutomationConditionNode;
};
