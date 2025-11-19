import { Extension } from "@tiptap/core";
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
import { NodeHighlightPlugin } from "@/plugins/highlight";

export const NodeHighlightExtension = Extension.create({
  name: ADDITIONAL_EXTENSIONS.NODE_HIGHLIGHT,
  addProseMirrorPlugins() {
    return [NodeHighlightPlugin()];
  },
});
