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

import type { ExIssueAttachment, ExState } from "@plane/sdk";
import { E_IMPORTER_KEYS } from "@/core";
import type { IPriorityConfig, IStateConfig } from "@/linear/types";

export const getTargetState = (stateMap: IStateConfig[], sourceState: string): ExState | undefined => {
  const targetState = stateMap.find((state: IStateConfig) => {
    if (state.source_state.id === sourceState) {
      state.target_state.external_source = E_IMPORTER_KEYS.LINEAR;
      state.target_state.external_id = sourceState;
      return state;
    }
  });

  return targetState?.target_state;
};

export const getTargetAttachments = (attachments: string[]): Partial<ExIssueAttachment[]> => {
  if (!attachments) {
    return [];
  }
  const attachmentArray = attachments
    .map(
      (attachment: string): Partial<ExIssueAttachment> => ({
        external_id: attachment,
        external_source: E_IMPORTER_KEYS.LINEAR,
        attributes: {
          name: "Attachment", // Linear SDK doesn't provide attachment details, so we use a placeholder
          size: 0,
        },
        asset: attachment,
      })
    )
    .filter((attachment) => attachment !== undefined) as ExIssueAttachment[];

  return attachmentArray;
};

export const getTargetPriority = (priorityMap: IPriorityConfig[], sourcePriority: number): string | undefined => {
  const targetPriority = priorityMap.find(
    (priority: IPriorityConfig) => priority.source_priority.priority === sourcePriority
  );
  return targetPriority?.target_priority;
};
