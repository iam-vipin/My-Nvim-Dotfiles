import { useEditorState } from "@tiptap/react";
import { FileCode2 } from "lucide-react";
import React, { useEffect, useRef, useState, memo, useCallback } from "react";
// plane imports
// import { useTranslation } from "@plane/i18n";
import { cn } from "@plane/utils";
// components
import type { ExternalEmbedNodeViewProps } from "@/types";
import { ExternalEmbedInputModal } from "./floating-input-modal";

export const ExternalEmbedBlock = memo(function ExternalEmbedBlock(externalEmbedProps: ExternalEmbedNodeViewProps) {
  // states
  const [isOpen, setIsOpen] = useState(false);
  const embedButtonRef = useRef<HTMLDivElement>(null);

  const { isFlagged, onClick } = externalEmbedProps.extension.options;
  const isTouchDevice = !!externalEmbedProps.editor.storage.utility?.isTouchDevice;
  // const { t } = useTranslation();

  // subscribe to external embed storage state
  const shouldOpenInput = useEditorState({
    editor: externalEmbedProps.editor,
    selector: ({ editor }) => {
      const storage = editor.storage.externalEmbedComponent;
      return editor.isEditable && storage.openInput;
    },
  });

  // handlers
  const handleEmbedButtonClick = useCallback(() => {
    if (isTouchDevice) {
      onClick?.();
      return;
    }
    if (externalEmbedProps.editor.isEditable) {
      return setIsOpen(true);
    }
  }, [externalEmbedProps.editor.isEditable, isTouchDevice, onClick]);

  // effects
  useEffect(() => {
    if (shouldOpenInput) {
      setIsOpen(true);
      // Reset the openInput flag using proper pattern
      const ExternalEmbedExtensionStorage = externalEmbedProps.editor.storage.externalEmbedComponent;
      ExternalEmbedExtensionStorage.openInput = false;
    }
  }, [shouldOpenInput, externalEmbedProps.editor]);

  const borderColor =
    externalEmbedProps.selected && externalEmbedProps.editor.isEditable
      ? "color-mix(in srgb, var(--border-color-accent-strong) 20%, transparent)"
      : undefined;

  return (
    <>
      <div
        ref={embedButtonRef}
        className={cn(
          "flex items-center justify-start gap-2 py-3 px-2 my-2 rounded-lg text-tertiary bg-layer-3 border border-dashed transition-all duration-200 ease-in-out cursor-default",
          {
            "border-subtle": !(externalEmbedProps.selected && externalEmbedProps.editor.isEditable),
            "hover:text-secondary hover:bg-layer-3-hover cursor-pointer": externalEmbedProps.editor.isEditable,
            "text-accent-secondary bg-accent-primary/10 border-accent-strong-200/10 hover:bg-accent-primary/10 hover:text-accent-secondary":
              externalEmbedProps.selected && externalEmbedProps.editor.isEditable,
          }
        )}
        style={borderColor ? { borderColor } : undefined}
        onClick={handleEmbedButtonClick}
      >
        <FileCode2 className="size-4 shrink-0" />

        <div className="text-14 font-medium">
          {"Insert your preferred embed link here, such as YouTube video, Figma design, etc."}
          {/* {t("externalEmbedComponent.placeholder.insert_embed")} */}
        </div>

        <input className="size-0 overflow-hidden" hidden type="file" multiple />
      </div>
      <ExternalEmbedInputModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        referenceElement={embedButtonRef.current}
        externalEmbedProps={externalEmbedProps}
        isFlagged={isFlagged}
      />
    </>
  );
});
