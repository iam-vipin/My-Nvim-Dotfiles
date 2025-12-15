import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { Tooltip } from "@plane/propel/tooltip";
import { IconButton } from "@plane/propel/icon-button";
// plane web hooks
import type { EPageStoreType } from "@/plane-web/hooks/store";
import { usePageStore } from "@/plane-web/hooks/store";
// hooks
import { usePaneTabToggle } from "@/plane-web/hooks/use-pane-tab-toggle";
// store
import type { TPageInstance } from "@/store/pages/base-page";

type TPageCommentControlProps = {
  page: TPageInstance;
  storeType: EPageStoreType;
};

export const PageCommentControl = observer(function PageCommentControl(props: TPageCommentControlProps) {
  const { storeType } = props;
  const { workspaceSlug } = useParams();
  const { isCommentsEnabled: canShowComments } = usePageStore(storeType);
  const { isActive, toggle } = usePaneTabToggle("comments");

  if (!canShowComments(workspaceSlug.toString())) return null;

  return (
    <Tooltip tooltipContent={isActive ? "Close comments" : "Open comments"} position="bottom">
      <IconButton
        variant={isActive ? "tertiary" : "ghost"}
        size="lg"
        icon={MessageSquareText}
        onClick={toggle}
        aria-label={isActive ? "Close comments" : "Open comments"}
      />
    </Tooltip>
  );
});
