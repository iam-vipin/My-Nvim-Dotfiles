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

// import CodeBlock, { CodeBlockOptions } from "@tiptap/extension-code-block";

import type { CodeBlockOptions } from "./code-block";
import { CodeBlock } from "./code-block";
import { LowlightPlugin } from "./lowlight-plugin";

type CodeBlockLowlightOptions = CodeBlockOptions & {
  lowlight: any;
  defaultLanguage: string | null | undefined;
};

export const CodeBlockLowlight = CodeBlock.extend<CodeBlockLowlightOptions>({
  addOptions() {
    return {
      ...(this.parent?.() ?? {
        languageClassPrefix: "language-",
        exitOnTripleEnter: true,
        exitOnArrowDown: true,
        HTMLAttributes: {},
      }),
      lowlight: {},
      defaultLanguage: null,
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      LowlightPlugin({
        name: this.name,
        lowlight: this.options.lowlight,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ];
  },
});
