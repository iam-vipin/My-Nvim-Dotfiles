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

import type { TProjectBaseActivity } from "./activity";

export interface IStateTransition {
  transition_state_id: string;
  approvers: string[];
}

export interface IStateWorkFlow {
  [transitionId: string]: IStateTransition;
}

export type TStateTransitionMap = Record<string, IStateTransition>; // transitionId: IStateTransition

export interface IStateWorkFlowResponse {
  allow_issue_creation: boolean;
  transitions: TStateTransitionMap;
}

export type TWorkflowChangeHistoryFields =
  | "is_workflow_enabled"
  | "allow_work_item_creation"
  | "state_transition"
  | "state_transition_approver"
  | "reset";

export type TWorkflowChangeHistoryVerbs = "added" | "removed" | "enabled" | "disabled" | "updated";

export type TWorkflowChangeHistoryKeys = `${TWorkflowChangeHistoryFields}_${TWorkflowChangeHistoryVerbs}`;

export type TWorkflowChangeHistory = TProjectBaseActivity<TWorkflowChangeHistoryFields, TWorkflowChangeHistoryVerbs> & {
  state_id?: string | null;
  transition_state_id?: string | null;
};

export interface IStateTransitionTree {
  transition_state_ids: string[];
  approvers: string[];
}
