import { useMemo } from "react";
import { observer } from "mobx-react";
// components
import { Logo } from "@/components/common/logo";
// hooks
import { useProject } from "@/hooks/store/use-project";
// store
import { ROLE_PERMISSIONS_TO_CREATE_PAGE } from "@/store/pages/project-page.store";
// local imports
import { MovePageModalListSection } from "../list-section";
import type { TMovePageSelectedValue } from "../root";

type Props = {
  searchTerm: string;
};

export const MovePageModalProjectsListSection: React.FC<Props> = observer((props) => {
  const { searchTerm } = props;
  // store hooks
  const { currentProjectDetails, getProjectById, joinedProjectIds } = useProject();
  // derived values
  const transferrableProjectIds = useMemo(
    () =>
      joinedProjectIds.filter((id) => {
        const projectDetails = getProjectById(id);
        const isCurrentProject = projectDetails?.id === currentProjectDetails?.id;
        const canCurrentUserMovePage =
          !!projectDetails?.member_role && ROLE_PERMISSIONS_TO_CREATE_PAGE.includes(projectDetails?.member_role);
        return !isCurrentProject && canCurrentUserMovePage;
      }),
    [currentProjectDetails, getProjectById, joinedProjectIds]
  );
  const filteredProjectIds = useMemo(
    () =>
      transferrableProjectIds.filter((id) => {
        const projectDetails = getProjectById(id);
        const projectQuery = `${projectDetails?.identifier} ${projectDetails?.name}`.toLowerCase();
        return projectQuery.includes(searchTerm.toLowerCase());
      }),
    [getProjectById, searchTerm, transferrableProjectIds]
  );

  if (filteredProjectIds.length === 0) return null;

  return (
    <MovePageModalListSection
      title="PROJECTS"
      items={filteredProjectIds}
      getItemDetails={(id) => {
        const projectDetails = getProjectById(id);
        if (!projectDetails) return null;
        return {
          logo: <Logo logo={projectDetails.logo_props} size={12} />,
          name: projectDetails.name,
          value: `project-${id}` satisfies TMovePageSelectedValue,
        };
      }}
    />
  );
});
