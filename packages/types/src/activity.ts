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

import type { TBaseActivityVerbsExtended } from "./activity-extended";

export type TBaseActivity<TFieldKey extends string = string, TVerbKey extends string = string> = {
  id: string;
  field: TFieldKey | undefined;
  epoch: number;
  verb: TVerbKey;
  comment: string | undefined;
  // updates
  old_value: string | undefined;
  new_value: string | undefined;
  old_identifier: string | undefined;
  new_identifier: string | undefined;
  // actor detail
  actor: string;
  // timestamp
  created_at: string;
  updated_at: string;
};

export type TWorkspaceBaseActivity<K extends string = string, V extends string = string> = TBaseActivity<K, V> & {
  workspace: string;
};

export type TProjectBaseActivity<K extends string = string, V extends string = string> = TWorkspaceBaseActivity<
  K,
  V
> & {
  project: string;
};

export type TBaseActivityVerbs = "created" | "updated" | "deleted" | "added" | TBaseActivityVerbsExtended;
