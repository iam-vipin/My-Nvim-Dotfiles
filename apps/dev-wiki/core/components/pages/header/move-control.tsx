"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { FolderOutput } from "lucide-react";
// plane imports
import { Tooltip } from "@plane/propel/tooltip";
// core imports
import { TPageMoveControlProps } from "@/ce/components/pages/header/move-control";
// local imports
import { MovePageModal } from "../modals/move-page-modal";

export const PageMoveControl = observer((props: TPageMoveControlProps) => {
  const { page } = props;
  // states
  const [isMovePageModalOpen, setIsMovePageModalOpen] = useState(false);

  return (
    <>
      <MovePageModal isOpen={isMovePageModalOpen} onClose={() => setIsMovePageModalOpen(false)} page={page} />
      <Tooltip tooltipContent="Move page" position="bottom">
        <button
          type="button"
          onClick={() => setIsMovePageModalOpen(true)}
          className="flex-shrink-0 size-6 grid place-items-center rounded text-custom-text-200 hover:text-custom-text-100 hover:bg-custom-background-80 transition-colors"
        >
          <FolderOutput className="size-3.5" />
        </button>
      </Tooltip>
    </>
  );
});
