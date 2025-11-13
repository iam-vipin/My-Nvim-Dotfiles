import { observer } from "mobx-react";
import useSWR from "swr";
import { Loader } from "@plane/ui";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";
import { MilestoneWorkItem } from "./milestone-work-item";

type TProps = {
  milestoneId: string;
  workspaceSlug: string;
  projectId: string;
};

export const MilestoneWorkItemsList = observer((props: TProps) => {
  const { milestoneId, workspaceSlug, projectId } = props;
  const { fetchMilestoneWorkItems, getMilestoneById } = useMilestones();

  const { isLoading } = useSWR(
    workspaceSlug && projectId && milestoneId
      ? `MILESTONE_WORK_ITEMS_${workspaceSlug}_${projectId}_${milestoneId}`
      : null,
    workspaceSlug && projectId && milestoneId
      ? () => fetchMilestoneWorkItems(workspaceSlug, projectId, milestoneId)
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
    }
  );

  if (isLoading)
    return (
      <Loader className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Loader.Item key={index} height="38px" />
        ))}
      </Loader>
    );

  const workItemIds = getMilestoneById(projectId, milestoneId)?.work_item_ids;

  return (
    <>
      {workItemIds?.map((workItemId) => (
        <MilestoneWorkItem
          key={workItemId}
          workspaceSlug={workspaceSlug}
          workItemId={workItemId}
          projectId={projectId}
          milestoneId={milestoneId}
        />
      ))}
    </>
  );
});
