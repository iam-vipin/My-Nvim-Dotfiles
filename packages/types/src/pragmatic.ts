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

export type TDropTarget = {
  element: Element;
  data: Record<string | symbol, unknown>;
};

export type TDropTargetMiscellaneousData = {
  dropEffect: string;
  isActiveDueToStickiness: boolean;
};

export interface IPragmaticPayloadLocation {
  initial: {
    dropTargets: (TDropTarget & TDropTargetMiscellaneousData)[];
  };
  current: {
    dropTargets: (TDropTarget & TDropTargetMiscellaneousData)[];
  };
  previous: {
    dropTargets: (TDropTarget & TDropTargetMiscellaneousData)[];
  };
}

export interface IPragmaticDropPayload {
  location: IPragmaticPayloadLocation;
  source: TDropTarget;
  self: TDropTarget & TDropTargetMiscellaneousData;
}

export type InstructionType = "reparent" | "reorder-above" | "reorder-below" | "make-child" | "instruction-blocked";
