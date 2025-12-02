"use client";

import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { Paperclip } from "lucide-react";

type Props = {
  disabled?: boolean;
  isLoading: boolean;
  open: () => void;
};

export const AttachmentActionButton: FC<Props> = observer((props) => {
  const { isLoading, disabled = false, open } = props;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="inline-flex items-center"
    >
      {/* Button: opens native file picker */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          // open file dialog exposed by useDropzone
          if (!disabled && !isLoading) open();
        }}
        disabled={disabled || isLoading}
        aria-label="Attach files"
        className="size-8 flex items-center justify-center hover:bg-custom-background-80 rounded-full"
      >
        <Paperclip className="h-4 w-4" />
      </button>
    </div>
  );
});
