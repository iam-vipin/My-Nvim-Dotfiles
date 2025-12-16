import { File, Download } from "lucide-react";
import { useEffect, useState } from "react";
// plane imports
import { convertBytesToSize } from "@plane/utils";
// local imports
import { EAttachmentBlockAttributeNames } from "../types";
import { getAttachmentBlockId, isVideoMimeType } from "../utils";
import type { CustomAttachmentNodeViewProps } from "./node-view";
import { CustomAttachmentVideoPreview } from "./video-preview";

type Props = CustomAttachmentNodeViewProps & {
  isTouchDevice: boolean;
  resolvedDownloadSource: string;
  resolvedSource: string;
};

export function CustomAttachmentBlock(props: Props) {
  const { editor, extension, node, resolvedDownloadSource, resolvedSource, isTouchDevice, selected } = props;

  // states
  const [hasCheckedExistence, setHasCheckedExistence] = useState(false);
  // derived values
  const { src } = node.attrs;
  const isPreview = node.attrs[EAttachmentBlockAttributeNames.PREVIEW];
  const fileType = node.attrs[EAttachmentBlockAttributeNames.FILE_TYPE] ?? "";
  const isVideo = isVideoMimeType(fileType);
  // extension options
  const { onClick } = extension.options;

  useEffect(() => {
    if (hasCheckedExistence || !src) return;
    const checkExistence = async () => {
      try {
        const doesAttachmentExist = await extension.options.checkIfAttachmentExists?.(src);
        if (!doesAttachmentExist) {
          await extension.options.restoreAttachment?.(src);
        }
      } catch (error) {
        console.error("Error in checking attachment existence", error);
      } finally {
        setHasCheckedExistence(true);
      }
    };
    checkExistence();
  }, [hasCheckedExistence, src, extension.options]);

  if (isPreview && isVideo) {
    return (
      <CustomAttachmentVideoPreview
        {...props}
        resolvedDownloadSource={resolvedDownloadSource}
        resolvedSource={resolvedSource}
        onDownloadClick={onClick}
      />
    );
  }

  return (
    <div
      key={node.attrs.id}
      id={getAttachmentBlockId(node.attrs.id ?? "")}
      className="py-3 px-2 rounded-lg bg-layer-2 hover:bg-layer-2-hover border border-subtle-1 flex items-start gap-2 transition-colors"
      contentEditable={false}
    >
      <a
        href={isTouchDevice ? undefined : resolvedSource}
        className="flex items-start gap-2 flex-1 min-w-0"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (isTouchDevice) onClick?.(resolvedSource);
        }}
      >
        <div className="flex-shrink-0 mt-1 size-8 grid place-items-center">
          <File className="flex-shrink-0 size-8 text-tertiary" />
        </div>
        <div className="truncate">
          <p className="not-prose text-13 truncate">{node.attrs[EAttachmentBlockAttributeNames.FILE_NAME]}</p>
          <p className="not-prose text-11 text-tertiary">
            {convertBytesToSize(Number(node.attrs[EAttachmentBlockAttributeNames.FILE_SIZE] || 0))}
          </p>
        </div>
      </a>
      <a
        href={resolvedDownloadSource}
        download={node.attrs[EAttachmentBlockAttributeNames.FILE_NAME]}
        className="flex-shrink-0 mt-1 p-1.5 rounded hover:bg-layer-2-hover text-tertiary hover:text-secondary transition-colors"
        title="Download"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Download className="size-4" />
      </a>
    </div>
  );
}
