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
import type { TCallbackMentionComponentProps } from "@plane/editor";
import type { TEditorMentionItem, TEditorMentionType } from "@plane/types";
// local imports
import { EditorWorkItemMention } from "./work-item";

export type TEditorMentionComponentProps = TCallbackMentionComponentProps & {
  getMentionDetails?: (mentionType: TEditorMentionType, entityId: string) => TEditorMentionItem | undefined;
};

export function EditorAdditionalMentionsRoot(props: TEditorMentionComponentProps) {
  const { entity_name } = props;

  switch (entity_name) {
    case "issue_mention":
      return <EditorWorkItemMention {...props} />;
    default:
      return null;
  }
}
