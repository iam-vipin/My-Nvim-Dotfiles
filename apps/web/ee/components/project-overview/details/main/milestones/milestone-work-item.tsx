import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
// hooks
import { CircleMinus, LinkIcon } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { EIssueServiceType } from "@plane/types";
import { CustomMenu } from "@plane/ui";
import { generateWorkItemLink } from "@plane/utils";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProject } from "@/hooks/store/use-project";
import { useProjectState } from "@/hooks/store/use-project-state";
// plane web imports
import { IssueIdentifier } from "@/plane-web/components/issues/issue-details/issue-identifier";
import { WorkItemPropertiesLite } from "@/plane-web/components/issues/issue-details/properties";
import { useMilestonesWorkItemOperations } from "./helper";

type TProps = {
  workspaceSlug: string;
  workItemId: string;
  projectId: string;
  milestoneId: string;
};

export const MilestoneWorkItem: FC<TProps> = observer((props) => {
  const { workspaceSlug, workItemId, projectId, milestoneId } = props;

  const project = useProject();
  const {
    issue: { getIssueById },
  } = useIssueDetail();
  const { getProjectStates } = useProjectState();
  const { t } = useTranslation();

  const workItem = getIssueById(workItemId);

  if (!workItem) return null;

  const projectDetail = workItem.project_id ? project.getProjectById(workItem.project_id) : undefined;
  const currentIssueStateDetail =
    (workItem.project_id && getProjectStates(workItem.project_id)?.find((state) => workItem.state_id === state.id)) ||
    undefined;

  const isEpic = workItem.is_epic;

  const workItemOperations = useMilestonesWorkItemOperations(
    isEpic ? EIssueServiceType.EPICS : EIssueServiceType.ISSUES,
    milestoneId
  );

  const workItemLink = generateWorkItemLink({
    workspaceSlug,
    projectId: projectId,
    issueId: workItem.id,
    projectIdentifier: projectDetail?.identifier,
    sequenceId: workItem.sequence_id,
    isEpic: isEpic,
  });

  // handlers
  const handleRemoveRelation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    workItemOperations.removeRelation(workspaceSlug, projectId, workItemId);
  };

  const handleCopyWorkItemLink = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    workItemOperations.copyText(workItemLink);
  };

  return (
    <div className="group relative flex min-h-11 h-full w-full items-center gap-3 px-1.5 py-1 transition-all hover:bg-custom-background-90">
      <div className="flex w-full truncate items-center gap-3">
        <div
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: currentIssueStateDetail?.color ?? "#737373" }}
        />
        <div className="flex-shrink-0">
          {projectDetail && (
            <IssueIdentifier
              projectId={projectDetail.id}
              issueTypeId={workItem.type_id || undefined}
              projectIdentifier={projectDetail.identifier}
              issueSequenceId={workItem.sequence_id}
              textContainerClassName="text-xs text-custom-text-200"
            />
          )}
        </div>
        <span className="w-full truncate text-sm text-custom-text-100">{workItem.name}</span>
      </div>
      <div className="flex-shrink-0 text-sm">
        <WorkItemPropertiesLite
          workspaceSlug={workspaceSlug}
          workItemId={workItem.id}
          disabled={false}
          workItemOperations={workItemOperations}
        />
      </div>
      <div className="flex-shrink-0 text-sm">
        <CustomMenu placement="bottom-end" ellipsis>
          <CustomMenu.MenuItem onClick={handleCopyWorkItemLink}>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{t("common.actions.copy_link")}</span>
            </div>
          </CustomMenu.MenuItem>

          <CustomMenu.MenuItem onClick={handleRemoveRelation}>
            <div className="flex items-center gap-2 text-red-500">
              <CircleMinus className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{isEpic ? "Remove epic" : "Remove work item"}</span>
            </div>
          </CustomMenu.MenuItem>
        </CustomMenu>
      </div>
    </div>
  );
});
