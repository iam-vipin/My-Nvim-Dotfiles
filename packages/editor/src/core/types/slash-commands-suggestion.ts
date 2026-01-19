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

import type { Editor, Range } from "@tiptap/core";
import type { CSSProperties } from "react";
import type { TEditorCommands } from "@/types";

export type CommandProps = {
  editor: Editor;
  range: Range;
};

export type TSlashCommandSectionKeys = "general" | "text-colors" | "background-colors";

export type ISlashCommandItem = {
  commandKey: TEditorCommands;
  key: string;
  title: string;
  description: string;
  searchTerms: string[];
  icon: React.ReactNode;
  iconContainerStyle?: CSSProperties;
  command: ({ editor, range }: CommandProps) => void;
  badge?: React.ReactNode;
  /** Optional function to conditionally show/hide the item based on editor state */
  shouldShow?: (editor: Editor) => boolean;
};
