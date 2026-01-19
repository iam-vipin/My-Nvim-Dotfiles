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

// plane web imports
import type { TEditorMentionComponentProps } from "@/plane-web/components/editor/embeds/mentions";
import { EditorAdditionalMentionsRoot } from "@/plane-web/components/editor/embeds/mentions";
// local components
import { EditorUserMention } from "./user";

export function EditorMentionsRoot(props: TEditorMentionComponentProps) {
  const { entity_identifier, entity_name } = props;

  switch (entity_name) {
    case "user_mention":
      return <EditorUserMention id={entity_identifier} />;
    default:
      return <EditorAdditionalMentionsRoot {...props} />;
  }
}
