import { observer } from "mobx-react";
import { useParams } from "react-router";
import useSWRImmutable from "swr/immutable";
// plane imports
import { Popover } from "@plane/propel/popover";
import type { TEditorWorkItemMention } from "@plane/types";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProject } from "@/hooks/store/use-project";
import { useProjectState } from "@/hooks/store/use-project-state";
// services
import { WorkspaceService } from "@/plane-web/services";
// local imports
import type { TEditorMentionComponentProps } from "../root";
import { EditorWorkItemMentionContent } from "./content";
import { EditorWorkItemMentionPreview } from "./preview";
// services init
const workspaceService = new WorkspaceService();

export const EditorWorkItemMention = observer(function EditorWorkItemMention(props: TEditorMentionComponentProps) {
  const { entity_identifier: workItemId, getMentionDetails } = props;
  // params
  const { workspaceSlug } = useParams();
  // store hooks
  const {
    issue: { getIssueById },
  } = useIssueDetail();
  const { getStateById } = useProjectState();
  const { getProjectIdentifierById } = useProject();
  // construct formatted work item details from store data
  const workItemDetailsFromStore = getIssueById(workItemId);
  const stateDetails = workItemDetailsFromStore ? getStateById(workItemDetailsFromStore?.state_id) : undefined;
  const projectIdentifier = workItemDetailsFromStore?.project_id
    ? getProjectIdentifierById(workItemDetailsFromStore.project_id)
    : undefined;
  const formattedWorkItemDetails: TEditorWorkItemMention | undefined =
    workItemDetailsFromStore && stateDetails && projectIdentifier
      ? {
          ...workItemDetailsFromStore,
          state__group: stateDetails?.group,
          state__name: stateDetails?.name,
          state__color: stateDetails?.color,
          project__identifier: projectIdentifier,
        }
      : undefined;
  // derived values
  const savedWorkItemDetails = formattedWorkItemDetails || getMentionDetails?.("issue_mention", workItemId);
  // fetch work item details
  const {
    data: fetchedWorkItemDetails,
    isLoading: isFetchingWorkItemDetails,
    error: errorFetchingWorkItemDetails,
  } = useSWRImmutable(
    workspaceSlug && !savedWorkItemDetails ? `WORK_ITEM_MENTION_DETAILS_${workItemId}` : null,
    workspaceSlug && !savedWorkItemDetails
      ? () => workspaceService.retrieveWorkspaceWorkItem(workspaceSlug, workItemId)
      : null,
    {
      shouldRetryOnError: false,
    }
  );
  const workItemDetails = savedWorkItemDetails || fetchedWorkItemDetails;

  return (
    <div className="not-prose !inline px-1 py-0.5 rounded bg-custom-primary-100/10 border border-custom-border-400 no-underline cursor-pointer">
      <Popover delay={100} openOnHover>
        <Popover.Button>
          {workItemDetails && !errorFetchingWorkItemDetails ? (
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
