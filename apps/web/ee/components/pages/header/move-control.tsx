import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { FolderOutput } from "lucide-react";
// plane imports
import { Tooltip } from "@plane/propel/tooltip";
import { IconButton } from "@plane/propel/icon-button";
// core imports
import type { TPageMoveControlProps } from "@/ce/components/pages/header/move-control";
// plane web hooks
import { usePageFlag } from "@/plane-web/hooks/use-page-flag";
// local imports
import { MovePageModal } from "../modals/move";

export const PageMoveControl = observer(function PageMoveControl(props: TPageMoveControlProps) {
  const { page } = props;
  // states
  const [isMovePageModalOpen, setIsMovePageModalOpen] = useState(false);
  // navigation
  const { workspaceSlug } = useParams();
  // derived values
  const { canCurrentUserMovePage } = page;
  // page flag
  const { isMovePageEnabled } = usePageFlag({
    workspaceSlug: workspaceSlug?.toString() ?? "",
  });

  if (!isMovePageEnabled || !canCurrentUserMovePage) return null;

  return (
    <>
      <MovePageModal isOpen={isMovePageModalOpen} onClose={() => setIsMovePageModalOpen(false)} page={page} />
      <Tooltip tooltipContent="Move page" position="bottom">
        <IconButton
          variant="ghost"
          size="lg"
          icon={FolderOutput}
          onClick={() => setIsMovePageModalOpen(true)}
          aria-label="Move page"
        />
      </Tooltip>
    </>
  );
});
