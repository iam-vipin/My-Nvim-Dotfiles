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

import type { MarkType, Node } from "@tiptap/pm/model";
import { PluginKey } from "@tiptap/pm/state";
import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import type { Options } from "./types";

export const MAX_MATCH = 100;
export const codeMarkPluginKey = new PluginKey("codemark");

export function getMarkType(view: EditorView | EditorState, opts?: Options): MarkType {
  if ("schema" in view) return opts?.markType ?? view.schema.marks.code;
  return opts?.markType ?? view.state.schema.marks.code;
}

export function safeResolve(doc: Node, pos: number) {
  return doc.resolve(Math.min(Math.max(1, pos), doc.nodeSize - 2));
}
