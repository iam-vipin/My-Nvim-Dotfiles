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

import type { MentionOptions } from "@tiptap/extension-mention";

export enum EPiChatEditorAttributeNames {
  ID = "id",
  LABEL = "label",
  TARGET = "target",
  SELF = "self",
  REDIRECT_URI = "redirect_uri",
  ENTITY_IDENTIFIER = "entity_identifier",
  ENTITY_NAME = "entity_name",
}

export type PiChatEditorMentionAttributes = {
  [EPiChatEditorAttributeNames.ID]: string | null;
  [EPiChatEditorAttributeNames.LABEL]: string | null;
  [EPiChatEditorAttributeNames.TARGET]: string | null;
  [EPiChatEditorAttributeNames.SELF]?: boolean;
  [EPiChatEditorAttributeNames.REDIRECT_URI]?: string;
  [EPiChatEditorAttributeNames.ENTITY_IDENTIFIER]: string | null;
  [EPiChatEditorAttributeNames.ENTITY_NAME]?: string | null;
};

export type PiChatEditorMentionItem = {
  id: string;
  title: string;
  subTitle: string | undefined;
  icon: React.ReactNode;
};

export type PiChatMentionSearchCallbackResponse = {
  [key: string]: PiChatEditorMentionItem[];
};

export type PiChatEditorMentionOptions = MentionOptions & {
  mentionHighlights: () => Promise<string[]>;
  readonly?: boolean;
};
