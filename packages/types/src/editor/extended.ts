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
import type { TIssue, TSearchEntities, TStateGroups } from "..";

export type TEditorEmbedType = "issue";
export type TEditorMentionType = Extract<TSearchEntities, "issue_mention">;

export type TEditorWorkItemEmbed = Pick<
  TIssue,
  "id" | "name" | "sequence_id" | "project_id" | "priority" | "type_id"
> & {
  project__identifier: string;
  state__group: TStateGroups;
  state__name: string;
  state__color: string;
};

export type TEditorWorkItemMention = Pick<TIssue, "id" | "name" | "sequence_id" | "project_id" | "type_id"> & {
  project__identifier: string;
  state__group: TStateGroups;
  state__name: string;
  state__color: string;
};

export type TEditorEmbedItem = TEditorWorkItemEmbed;
export type TEditorMentionItem = TEditorWorkItemMention;

export type TEditorEmbedsResponse = TEditorEmbedItem[];
export type TEditorMentionsResponse = TEditorMentionItem[];
