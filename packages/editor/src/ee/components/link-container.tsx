import type { Editor } from "@tiptap/core";
import { LinkViewContainer } from "@/components/editors/link-view-container";
import { EmbedLinkViewContainer } from "./embed-link-view-container";

export function LinkContainer({
  editor,
  containerRef,
}: {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <>
      <LinkViewContainer editor={editor} containerRef={containerRef} />
      <EmbedLinkViewContainer editor={editor} containerRef={containerRef} />
    </>
  );
}
