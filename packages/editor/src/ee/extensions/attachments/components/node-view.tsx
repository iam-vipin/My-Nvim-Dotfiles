import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
// plane utils
import { cn } from "@plane/utils";
// local imports
import type { AttachmentExtension, TAttachmentBlockAttributes } from "../types";
import { CustomAttachmentBlock } from "./block";
import { CustomAttachmentFlaggedState } from "./flagged-state";
import { CustomAttachmentUploader } from "./uploader";

export type CustomAttachmentNodeViewProps = Omit<NodeViewProps, "extension"> & {
  extension: AttachmentExtension;
  node: NodeViewProps["node"] & {
    attrs: TAttachmentBlockAttributes;
  };
  updateAttributes: (attrs: Partial<TAttachmentBlockAttributes>) => void;
};

export const CustomAttachmentNodeView: React.FC<CustomAttachmentNodeViewProps> = (props) => {
  const { editor, extension, node } = props;
  // states
  const [resolvedSource, setResolvedSource] = useState<string | null>(null);
  // refs
  const attachmentComponentRef = useRef<HTMLDivElement>(null);
  // derived values
  const { src } = node.attrs;
  const isAttachmentUploaded = !!src;
  const isExtensionFlagged = extension.options.isFlagged;
  const isTouchDevice = !!editor.storage.utility.isTouchDevice;

  useEffect(() => {
    if (!src || resolvedSource) return;
    const getAttachmentSource = async () => {
      const source = await extension.options.getAttachmentSource?.(src);
      setResolvedSource(source);
    };
    getAttachmentSource();
  }, [extension.options, resolvedSource, src]);

  return (
    <NodeViewWrapper
      className={cn("editor-attachment-component", {
        "touch-select-none": isTouchDevice,
      })}
    >
      {isExtensionFlagged ? (
        <div className="p-0 mx-0 py-2 not-prose">
          <CustomAttachmentFlaggedState />
        </div>
      ) : (
        <div className="p-0 mx-0 py-2 not-prose" ref={attachmentComponentRef} contentEditable={false}>
          {isAttachmentUploaded ? (
            <>
              {resolvedSource && (
                <CustomAttachmentBlock {...props} isTouchDevice={isTouchDevice} resolvedSource={resolvedSource} />
              )}
            </>
          ) : (
            <CustomAttachmentUploader {...props} />
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};
