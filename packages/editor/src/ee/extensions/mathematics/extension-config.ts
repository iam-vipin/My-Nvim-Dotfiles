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

import { Extension } from "@tiptap/core";
// plane imports
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// local imports
import { BlockMathExtension } from "./block-math/extension";
import { InlineMathExtension } from "./inline-math/extension";
// types
import type { MathematicsExtensionOptions, MathematicsExtensionStorage } from "./types";

declare module "@tiptap/core" {
  interface Storage {
    [ADDITIONAL_EXTENSIONS.MATHEMATICS]: MathematicsExtensionStorage;
  }
}

export const MathematicsExtensionConfig = Extension.create<MathematicsExtensionOptions, MathematicsExtensionStorage>({
  name: ADDITIONAL_EXTENSIONS.MATHEMATICS,

  addOptions() {
    return {
      isFlagged: false,
      onClick: undefined,
    };
  },

  addStorage() {
    return {
      openMathModal: false,
    };
  },

  addExtensions() {
    return [
      BlockMathExtension.configure({
        isFlagged: this.options.isFlagged,
        onClick: this.options.onClick,
      }),
      InlineMathExtension.configure({
        isFlagged: this.options.isFlagged,
        onClick: this.options.onClick,
      }),
    ];
  },
});
