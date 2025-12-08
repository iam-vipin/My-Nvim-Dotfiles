import type { FC } from "react";
import { observer } from "mobx-react";
import { MilestoneIcon } from "@plane/propel/icons";
import { Loader } from "@plane/ui";
import { SectionEmptyState } from "@/plane-web/components/common/layout/main/common/empty-state";
import { SectionWrapper } from "@/plane-web/components/common/layout/main/common/section-wrapper";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";
import { AddMilestoneButton } from "./add-milestone-button";
import { MilestoneCard } from "./milestone-card";

type Props = {
  workspaceSlug: string;
  projectId: string;
  toggleCreateUpdateModal: () => void;
};

export const ProjectMilestoneRoot = observer(function ProjectMilestoneRoot(props: Props) {
  const { workspaceSlug, projectId, toggleCreateUpdateModal } = props;
  // store hooks
  const { getProjectMilestoneIds, milestoneLoader } = useMilestones();
  // derived values
  const milestoneIds = getProjectMilestoneIds(projectId);

  const isEmpty = milestoneIds?.length === 0 || !milestoneIds;

  if (milestoneLoader) {
    return (
      <div className="mt-3">
        <Loader className="space-y-4">
          <Loader.Item height="120px" />
          <Loader.Item height="120px" />
        </Loader>
      </div>
    );
  }

  if (isEmpty)
    return (
      <SectionWrapper>
        <SectionEmptyState
          heading="No milestones yet"
          subHeading="Start adding milestones to manage and track the progress."
          icon={<MilestoneIcon className="size-4" />}
          actionElement={<AddMilestoneButton toggleModal={toggleCreateUpdateModal} />}
        />
      </SectionWrapper>
    );

  return (
    <div className="space-y-4">
      {milestoneIds.map((milestoneId) => (
        <MilestoneCard
          key={milestoneId}
          milestoneId={milestoneId}
          workspaceSlug={workspaceSlug}
          projectId={projectId}
        />
      ))}
    </div>
  );
});
