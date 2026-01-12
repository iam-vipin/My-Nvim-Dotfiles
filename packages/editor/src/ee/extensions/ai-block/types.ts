import type { Extension, Node as ProseMirrorNode } from "@tiptap/core";
import type { NodeViewProps } from "@tiptap/react";
import type { TAIBlockHandlers, TAIBlockType, TAIBlockRevisionType, TAIBlockDetails } from "@plane/types";

export enum EAIBlockAttributeNames {
  ID = "data-id",
}

export type TAIBlockAttributes = {
  [EAIBlockAttributeNames.ID]: string | null;
};

// Data props that will be passed to the UI component
export type TAIBlockWidgetProps = {
  blockTypes: TAIBlockType[];
  revisionTypes: TAIBlockRevisionType[];
  blocks: TAIBlockDetails[];
};

// Forward declaration of extension props (to avoid circular dependency)
export type CustomAIBlockExtensionProps = {
  aiBlockHandlers?: TAIBlockHandlers;
  widgetCallback?: React.ComponentType<TAIBlockNodeViewProps>;
};

// Node view props passed to the widget callback
export type TAIBlockNodeViewProps = Omit<NodeViewProps, "extension"> & {
  node: NodeViewProps["node"] & {
    attrs: TAIBlockAttributes;
  };
  extension: Extension<CustomAIBlockExtensionProps>;
  updateAttributes: (attrs: Partial<TAIBlockAttributes>) => void;
};

export type CustomAIBlockExtensionStorage = Record<string, never>;

export type CustomAIBlockExtensionType = ProseMirrorNode<CustomAIBlockExtensionProps, CustomAIBlockExtensionStorage>;
