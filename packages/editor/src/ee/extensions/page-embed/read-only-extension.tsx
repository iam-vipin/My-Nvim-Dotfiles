import type { Editor } from "@tiptap/react";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
// types
import type { TPageEmbedConfig } from "@/types";
// extension config
import type { PageEmbedExtensionAttributes } from "./extension-config";
import { PageEmbedExtensionConfig } from "./extension-config";

type Props = {
  widgetCallback: TPageEmbedConfig["widgetCallback"];
};

export function PageEmbedReadOnlyExtension(props: Props) {
  return PageEmbedExtensionConfig.extend({
    selectable: false,
    draggable: false,

    addNodeView() {
      return ReactNodeViewRenderer(
        (embedProps: {
          node: { attrs: PageEmbedExtensionAttributes };
          editor: Editor;
          updateAttributes: (attrs: Partial<PageEmbedExtensionAttributes>) => void;
        }) => (
          <NodeViewWrapper>
            {props.widgetCallback({
              pageId: embedProps.node.attrs.entity_identifier as string,
              workspaceSlug: embedProps.node.attrs.workspace_identifier,
            })}
          </NodeViewWrapper>
        )
      );
    },
  });
}
