import { useState } from "react";
import { observer } from "mobx-react";
// components
import { IssuePeekOverview } from "@/components/issues/peek-overview";
import { useProject } from "@/hooks/store/use-project";
import { CollapsibleDetailSection } from "@/plane-web/components/common/layout/main/sections/collapsible-root";
import { EpicPeekOverview } from "@/plane-web/components/epics/peek-overview";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";
import { AddMilestoneButton } from "./add-milestone-button";
import { CreateUpdateMilestoneModal } from "./create-update-modal";
import { ProjectMilestoneRoot } from "./root";

type Props = {
  workspaceSlug: string;
  projectId: string;
};
export const ProjectMilestoneCollapsibleRoot = observer(function ProjectMilestoneCollapsibleRoot(props: Props) {
  const { workspaceSlug, projectId } = props;
  // state
  const [isCreateUpdateMilestoneModalOpen, setIsCreateUpdateMilestoneModalOpen] = useState(false);
  // store hooks
  const { openCollapsibleSection, toggleOpenCollapsibleSection } = useProject();
  const { isMilestonesEnabled } = useMilestones();
  const { getProjectMilestoneIds } = useMilestones();
  // derived values
  const projectMilestoneIds = getProjectMilestoneIds(projectId);
  const milestoneCount = projectMilestoneIds?.length ?? 0;

  const toggleCreateUpdateModal = () => {
    setIsCreateUpdateMilestoneModalOpen((prev) => !prev);
  };

  const shouldRenderMilestones = isMilestonesEnabled(workspaceSlug, projectId);
  if (!shouldRenderMilestones) return null;

  return (
    <>
      <CreateUpdateMilestoneModal
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        isOpen={isCreateUpdateMilestoneModalOpen}
        handleClose={() => setIsCreateUpdateMilestoneModalOpen(false)}
      />
      <CollapsibleDetailSection
        title="Milestones"
        actionItemElement={<AddMilestoneButton toggleModal={toggleCreateUpdateModal} variant="compact" />}
        count={milestoneCount}
        collapsibleContent={
          <div className="mt-3">
            <ProjectMilestoneRoot
              workspaceSlug={workspaceSlug}
              projectId={projectId}
              toggleCreateUpdateModal={toggleCreateUpdateModal}
            />
          </div>
        }
        isOpen={openCollapsibleSection.includes("milestones")}
        onToggle={() => toggleOpenCollapsibleSection("milestones")}
      />
      <IssuePeekOverview />
      <EpicPeekOverview />
    </>
  );
});
