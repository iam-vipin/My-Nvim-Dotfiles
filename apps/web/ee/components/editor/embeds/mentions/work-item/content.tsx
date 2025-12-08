import { useCallback } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import type { TEditorWorkItemMention } from "@plane/types";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// local imports
import { EditorWorkItemMentionLogo } from "./logo";

type Props = {
  workItemDetails: TEditorWorkItemMention;
};

export const EditorWorkItemMentionContent: React.FC<Props> = observer((props) => {
  const { workItemDetails } = props;
  // params
  const { workspaceSlug } = useParams();
  // store hooks
  const { setPeekIssue } = useIssueDetail();
  // handle click to open the peek overview
  const handleClick = useCallback(() => {
    if (!workItemDetails || !workItemDetails.project_id || !workspaceSlug) return;

    setPeekIssue({
      issueId: workItemDetails.id,
      projectId: workItemDetails?.project_id,
      workspaceSlug: workspaceSlug.toString(),
    });
  }, [workItemDetails, setPeekIssue, workspaceSlug]);

  return (
    <button
      type="button"
      className="group/work-item-mention not-prose inline-flex items-center gap-1 w-fit text-sm font-medium outline-none"
      onClick={handleClick}
    >
      <EditorWorkItemMentionLogo
        className="shrink-0 size-3"
        projectId={workItemDetails.project_id}
        stateColor={workItemDetails.state__color}
        stateGroup={workItemDetails.state__group}
        workItemTypeId={workItemDetails.type_id}
      />
      <span className="text-custom-text-300">
        {workItemDetails.project__identifier}-{workItemDetails.sequence_id}
      </span>
      <span className="text-custom-text-200 group-hover/work-item-mention:text-custom-text-100 transition-colors">
        {workItemDetails.name}
      </span>
    </button>
  );
});
