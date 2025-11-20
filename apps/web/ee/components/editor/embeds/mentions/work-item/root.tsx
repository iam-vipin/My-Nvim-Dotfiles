import { observer } from "mobx-react";
import { useParams } from "react-router";
import useSWR from "swr";
// plane imports
import { Popover } from "@plane/propel/popover";
// services
import { WorkspaceService } from "@/plane-web/services";
// local imports
import type { TEditorMentionComponentProps } from "../root";
import { EditorWorkItemMentionContent } from "./content";
import { EditorWorkItemMentionPreview } from "./preview";
// services init
const workspaceService = new WorkspaceService();

export const EditorWorkItemMention: React.FC<TEditorMentionComponentProps> = observer((props) => {
  const { entity_identifier: workItemId, getMentionDetails } = props;
  // params
  const { workspaceSlug } = useParams();
  // derived values
  const savedWorkItemDetails = getMentionDetails?.("issue_mention", workItemId);
  // fetch work item details
  const { data: fetchedWorkItemDetails, isLoading: isFetchingWorkItemDetails } = useSWR(
    workspaceSlug && !savedWorkItemDetails ? `WORK_ITEM_MENTION_DETAILS_${workItemId}` : null,
    workspaceSlug && !savedWorkItemDetails
      ? () => workspaceService.retrieveWorkspaceWorkItem(workspaceSlug, workItemId)
      : null,
    {
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );
  const workItemDetails = savedWorkItemDetails || fetchedWorkItemDetails;

  return (
    <div className="not-prose !inline px-1 py-0.5 rounded bg-custom-primary-100/10 border border-custom-border-400 no-underline cursor-pointer">
      <Popover delay={100} openOnHover>
        <Popover.Button>
          {workItemDetails ? (
            <EditorWorkItemMentionContent workItemDetails={workItemDetails} />
          ) : (
            <span className="text-custom-text-300">{isFetchingWorkItemDetails ? "..." : "work item not found"}</span>
          )}
        </Popover.Button>
        <Popover.Panel side="bottom" align="start">
          <div className="p-3 space-y-2 w-72 rounded-lg shadow-custom-shadow-rg bg-custom-background-100 border-[0.5px] border-custom-border-300">
            {workItemDetails ? (
              <EditorWorkItemMentionPreview workItemDetails={workItemDetails} />
            ) : (
              <p className="text-custom-text-300 text-sm">
                The mentioned work item is not found. It&apos;s either deleted or not accessible to you.
              </p>
            )}
          </div>
        </Popover.Panel>
      </Popover>
    </div>
  );
});
