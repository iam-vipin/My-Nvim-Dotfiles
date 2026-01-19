import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { BriefcaseIcon } from "lucide-react";
// plane imports
import { CycleIcon, ModuleIcon, LayersIcon, PageIcon, ViewsIcon } from "@plane/propel/icons";
// local imports
import type { PiChatEditorMentionAttributes } from "./types";

const getIcon = (type: string) => {
  switch (type) {
    case "pages":
      return PageIcon;
    case "cycles":
      return CycleIcon;
    case "modules":
      return ModuleIcon;
    case "projects":
      return BriefcaseIcon;
    case "issues":
      return LayersIcon;
    case "views":
      return ViewsIcon;
    default:
      return LayersIcon;
  }
};
export type PiChatEditorMentionNodeViewProps = NodeViewProps & {
  node: NodeViewProps["node"] & {
    attrs: PiChatEditorMentionAttributes;
  };
};

export function PiChatEditorMentionNodeView(props: PiChatEditorMentionNodeViewProps) {
  // derived values
  const { redirect_uri, label, target } = props.node.attrs;
  const Icon = getIcon(target ?? "");
  return (
    <NodeViewWrapper
      as="a"
      href={redirect_uri}
      target="_blank"
      className="mention-component inline-flex w-fit items-center gap-1 rounded-sm bg-accent-primary/20 text-accent-primary px-1"
    >
      <Icon className="size-[14px] flex-shrink-0" />
      {label}
    </NodeViewWrapper>
  );
}
