import { useState } from "react";
import { Plus } from "lucide-react";
import type { ISearchIssueResponse, TProjectIssuesSearchParams } from "@plane/types";
import { ExistingIssuesListModal } from "@/components/core/modals/existing-issues-list-modal";
import milestoneService from "@/plane-web/services/milestone.service";

type Props = {
  projectId: string;
  workspaceSlug: string;
  customButton?: React.ReactNode;
  handleSubmit: (data: ISearchIssueResponse[]) => Promise<void>;
  selectedWorkItemIds?: string[];
  milestoneId?: string;
};
export function MilestoneWorkItemActionButton(props: Props) {
  const { projectId, workspaceSlug, customButton, handleSubmit, selectedWorkItemIds, milestoneId } = props;

  const [workItemsModal, setWorkItemsModal] = useState<boolean>(false);

  const workItemSearchCallBack = async (params: TProjectIssuesSearchParams) =>
    milestoneService.workItemsSearch(workspaceSlug, projectId, params);

  const handleClick = (e: React.MouseEvent<HTMLDivElement | SVGSVGElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setWorkItemsModal(true);
  };

  return (
    <>
      <ExistingIssuesListModal
        workspaceSlug={workspaceSlug}
        isOpen={workItemsModal}
        handleClose={() => setWorkItemsModal(false)}
        searchParams={{ milestone_id: milestoneId }}
        selectedWorkItemIds={selectedWorkItemIds}
        handleOnSubmit={handleSubmit}
        workItemSearchServiceCallback={workItemSearchCallBack}
      />
      {customButton ? (
        <div onClick={handleClick}>{customButton}</div>
      ) : (
        <Plus className="size-4 text-secondary cursor-pointer" onClick={handleClick} />
      )}
    </>
  );
}
