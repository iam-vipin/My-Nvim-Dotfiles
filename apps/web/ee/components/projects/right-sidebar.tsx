import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
// components
import { getProjectActivePath } from "@/components/settings/helper";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
// plane web components
import { ProjectMembersActivitySidebar } from "@/plane-web/components/projects/members/siderbar";
import { useFlag } from "@/plane-web/hooks/store";
import { PROJECT_SETTINGS } from "@/plane-web/constants";

type TProjectRightSidebarProps = { workspaceSlug: string; projectId: string };

export const ProjectRightSidebar = observer(function ProjectRightSidebar(props: TProjectRightSidebarProps) {
  const { workspaceSlug, projectId } = props;
  // next hooks
  const pathname = usePathname();
  // store hooks
  const isProjectMembersActivityEnabled = useFlag(workspaceSlug, E_FEATURE_FLAGS.PROJECT_MEMBER_ACTIVITY);

  return (
    <>
      {/* Project members activity sidebar */}
      {projectId &&
        getProjectActivePath(pathname) === PROJECT_SETTINGS["members"]["i18n_label"] &&
        isProjectMembersActivityEnabled && (
          <div className="block">
            <ProjectMembersActivitySidebar workspaceSlug={workspaceSlug} projectId={projectId} />
          </div>
        )}
    </>
  );
});
