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

import Blockquote from "@tiptap/extension-blockquote";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";

export const CustomQuoteExtension = Blockquote.extend({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        try {
          const { $from, $to, $head } = this.editor.state.selection;
          const parent = $head.node(-1);

          if (!parent) return false;

          if (parent.type.name !== CORE_EXTENSIONS.BLOCKQUOTE) {
            return false;
          }
          if ($from.pos !== $to.pos) return false;
          // if ($head.parentOffset < $head.parent.content.size) return false;

          // this.editor.commands.insertContentAt(parent.ne);
          this.editor.chain().splitBlock().lift(this.name).run();

          return true;
        } catch (error) {
          console.error("Error handling Enter in blockquote:", error);
          return false;
        }
      },
    };
  },
});
