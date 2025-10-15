"use client";

import type { Dispatch, FC, SetStateAction } from "react";
import React, { useCallback, useState, useEffect } from "react";
import { observer } from "mobx-react";
import type { FileRejection } from "react-dropzone";
import { useDropzone } from "react-dropzone";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
// hooks
// plane web hooks
import { cn } from "@plane/utils";
import { getFileIcon } from "@/components/icons";
import { useFlag } from "@/plane-web/hooks/store/use-flag";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { useFileSize } from "@/plane-web/hooks/use-file-size";
import type { TFocus, TPiAttachment } from "@/plane-web/types/pi-chat";

type Props = {
  disabled?: boolean;
  workspaceSlug: string;
  workspaceId: string;
  chatId: string | undefined;
  isProjectLevel: boolean;
  focus: TFocus;
  createNewChat: (focus: TFocus, isProjectLevel: boolean, workspaceId: string) => Promise<string>;
  setAttachments: Dispatch<SetStateAction<TPiAttachment[]>>;
  children: (isUploading: boolean, open: () => void) => React.ReactNode;
};

export const DndWrapper: FC<Props> = observer((props) => {
  const {
    workspaceSlug,
    workspaceId,
    chatId,
    disabled = false,
    setAttachments,
    isProjectLevel,
    createNewChat,
    focus,
    children,
  } = props;

  // state
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileIcon = getFileIcon("", 60);
  let dragCounter = 0; // keeps track of nested dragenter/dragleave events

  // store hooks
  const {
    attachmentStore: { createAttachment },
  } = usePiChat();
  const isFileUploadsEnabled = useFlag(workspaceSlug, E_FEATURE_FLAGS.PI_FILE_UPLOADS);

  // file size
  const { maxFileSize } = useFileSize();
  // onDrop handler
  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      let successCount = 0;
      if (rejectedFiles.length === 0) {
        setIsUploading(true);
        for (const file of acceptedFiles) {
          const currentFile: File = file;
          if (!currentFile) return;
          let chatIdToUse = chatId;
          if (!chatIdToUse) chatIdToUse = await createNewChat(focus, isProjectLevel, workspaceId);
          await createAttachment(currentFile, workspaceId, chatIdToUse)
            .then((res: TPiAttachment | void) => {
              if (!res) return;
              setAttachments((prev) => [...prev, res]);
              successCount++;
            })
            .catch((e: any) => {
              setToast({
                type: TOAST_TYPE.ERROR,
                title: `Failed to upload ${currentFile.name}`,
                message: e?.detail || "File could not be attached. Try uploading again.",
              });
            });
        }
      }
      setIsUploading(false);

      if (successCount > 0) {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: `Successfully uploaded`,
          message: `${successCount} attachment(s) have been successfully uploaded`,
        });
      }
      return;
    },
    [chatId, isProjectLevel, workspaceId, focus]
  );

  // useDropzone: noClick true so root div won't open file dialog (button will)
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    multiple: true,
    disabled: isUploading || disabled || !isFileUploadsEnabled,
    noClick: true, // prevent root div from opening file dialog on click
    noKeyboard: false,
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".webp"],
      "application/pdf": [".pdf"],
    },
  });

  useEffect(() => {
    if (!isFileUploadsEnabled) return;
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) setIsDragging(false);
    };

    const handleDrop = () => {
      dragCounter = 0;
      setIsDragging(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [isFileUploadsEnabled]);
  return (
    <>
      <div
        {...getRootProps({
          role: "button",
          tabIndex: 0,
          "aria-label": "Drop files here to upload",
          className: cn(
            "relative w-full rounded-xl border border-transparent text-sm transition-colors focus:outline-none focus:ring",
            {
              "border-dashed border-custom-primary-100 bg-custom-primary-100/10": isDragging,
            }
          ),
        })}
      >
        <input {...getInputProps()} />
        {isDragging && (
          <div className="w-full h-full bg-custom-background-100 z-30 absolute top-0 left-0 rounded-xl overflow-hidden">
            <div className="flex items-center justify-center gap-4 h-full bg-custom-primary-100/10">
              {fileIcon}
              <span className="text-base text-custom-primary-100">Drop any files here to add to chat</span>
            </div>
          </div>
        )}
        {children(isUploading, open)}
      </div>
      <div className="text-xs text-custom-text-350 pt-2 text-center bg-custom-background-100">
        Plane AI can make mistakes, please double-check responses.
      </div>
    </>
  );
});
