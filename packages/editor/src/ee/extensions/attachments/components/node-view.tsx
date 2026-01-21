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

import type { NodeViewProps } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
// plane utils
import { cn } from "@plane/utils";
// version diff support
import { YChangeNodeViewWrapper } from "@/components/editors/version-diff/extensions/ychange-node-view-wrapper";
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

export function CustomAttachmentNodeView(props: CustomAttachmentNodeViewProps) {
  const { decorations, editor, extension, node } = props;
  // states
  const [resolvedSource, setResolvedSource] = useState<string | null>(null);
  const [resolvedDownloadSource, setResolvedDownloadSource] = useState<string | null>(null);
  // refs
  const attachmentComponentRef = useRef<HTMLDivElement>(null);
  // derived values
  const { src } = node.attrs;
  const isAttachmentUploaded = !!src;
  const isExtensionFlagged = extension.options.isFlagged;
  const isTouchDevice = !!editor.storage.utility.isTouchDevice;

  useEffect(() => {
    setResolvedSource(null);
    setResolvedDownloadSource(null);
  }, [src]);

  useEffect(() => {
    if (!src || resolvedSource || resolvedDownloadSource) return;
    const getAttachmentSources = async () => {
      const source = await extension.options.getAttachmentSource?.(src);
      setResolvedSource(source);
      const downloadSource = await extension.options.getAttachmentDownloadSource?.(src);
      setResolvedDownloadSource(downloadSource);
    };
    getAttachmentSources();
  }, [src, extension.options, resolvedSource, resolvedDownloadSource]);

  return (
    <YChangeNodeViewWrapper
      decorations={decorations}
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
              {resolvedSource && resolvedDownloadSource && (
                <CustomAttachmentBlock
                  {...props}
                  isTouchDevice={isTouchDevice}
                  resolvedDownloadSource={resolvedDownloadSource}
                  resolvedSource={resolvedSource}
                />
              )}
            </>
          ) : (
            <CustomAttachmentUploader {...props} />
          )}
        </div>
      )}
    </YChangeNodeViewWrapper>
  );
}
