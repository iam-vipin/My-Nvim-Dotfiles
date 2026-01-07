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
import type { EUpdateStatus } from "../enums";
import type { TUpdate, TUpdateComment } from "./base";

// Define a type for the mandatory epicId in ...args
export type InitiativeArgs = [initiativeId: string];
export type EpicArgs = [epicId: string];
export type TCommentLoader = "fetch" | "create" | "update" | "delete" | "mutate" | undefined;

export type TUpdateOperations = {
  fetchUpdates?: (params?: { search: EUpdateStatus }) => Promise<TUpdate[]>;
  createUpdate: (data: Partial<TUpdate>) => Promise<void>;
  patchUpdate: (updateId: string, data: Partial<TUpdate>) => Promise<void>;
  removeUpdate: (updateId: string) => Promise<void>;
  createComment: (updateId: string, data: Partial<TUpdateComment>) => Promise<void>;
  patchComment: (commentId: string, data: Partial<TUpdateComment>) => Promise<void>;
  removeComment: (updateId: string, commentId: string) => Promise<void>;
  fetchComments: (updateId: string, loaderType: TCommentLoader) => Promise<void>;
  createReaction: (updateId: string, reaction: string) => Promise<void>;
  removeReaction: (updateId: string, reaction: string) => Promise<void>;
};
