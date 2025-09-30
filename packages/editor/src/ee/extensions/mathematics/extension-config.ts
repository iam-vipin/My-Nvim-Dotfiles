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
