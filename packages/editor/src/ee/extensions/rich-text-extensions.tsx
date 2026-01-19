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

import type { AnyExtension, Extensions } from "@tiptap/core";
// core imports
import type {
  TRichTextEditorAdditionalExtensionsProps,
  TRichTextEditorAdditionalExtensionsRegistry,
} from "src/ce/extensions/rich-text-extensions";
// root
import type { TSlashCommandAdditionalOption } from "@/extensions/slash-commands/root";
import { SlashCommands } from "@/extensions/slash-commands/root";
// types
import type { TExtensions } from "@/types";

/**
 * Registry for slash commands
 * Each entry defines a single slash command option with its own enabling logic
 */
const slashCommandRegistry: {
  isEnabled: (disabledExtensions: TExtensions[], flaggedExtensions: TExtensions[]) => boolean;
  getOption: (props: TRichTextEditorAdditionalExtensionsProps) => TSlashCommandAdditionalOption | null;
}[] = [];

const extensionRegistry: TRichTextEditorAdditionalExtensionsRegistry[] = [
  {
    isEnabled: (disabledExtensions) => !disabledExtensions.includes("slash-commands"),
    getExtension: (props) => {
      const { disabledExtensions, flaggedExtensions } = props;
      // Get enabled slash command options from the registry
      const slashCommandOptions = slashCommandRegistry
        .filter((command) => command.isEnabled(disabledExtensions, flaggedExtensions))
        .map((command) => command.getOption(props))
        .filter((option): option is TSlashCommandAdditionalOption => option !== null);

      return SlashCommands({
        additionalOptions: slashCommandOptions,
        disabledExtensions,
        flaggedExtensions,
      });
    },
  },
];

export function RichTextEditorAdditionalExtensions(props: TRichTextEditorAdditionalExtensionsProps) {
  const { disabledExtensions, flaggedExtensions } = props;

  const extensions: Extensions = extensionRegistry
    .filter((config) => config.isEnabled(disabledExtensions, flaggedExtensions))
    .map((config) => config.getExtension(props))
    .filter((extension): extension is AnyExtension => extension !== undefined);

  return extensions;
}
