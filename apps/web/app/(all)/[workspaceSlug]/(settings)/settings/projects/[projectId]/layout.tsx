import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import { Outlet } from "react-router";
// components
import { getProjectActivePath } from "@/components/settings/helper";
import { SettingsMobileNav } from "@/components/settings/mobile";
import { ProjectSettingsSidebar } from "@/components/settings/project/sidebar";
// plane web imports
import { ProjectAuthWrapper } from "@/plane-web/layouts/project-wrapper";
import { ProjectRightSidebar } from "@/plane-web/components/projects/right-sidebar";
// types
import type { Route } from "./+types/layout";

const ProjectDetailSettingsLayout = observer(function ProjectDetailSettingsLayout({ params }: Route.ComponentProps) {
  const { workspaceSlug, projectId } = params;
  // router
  const pathname = usePathname();

  return (
    <>
      <SettingsMobileNav hamburgerContent={ProjectSettingsSidebar} activePath={getProjectActivePath(pathname) || ""} />
      <div className="relative flex h-full w-full">
        <div className="hidden md:block">{projectId && <ProjectSettingsSidebar />}</div>
        <ProjectAuthWrapper workspaceSlug={workspaceSlug} projectId={projectId}>
          <div className="w-full h-full overflow-y-scroll md:pt-page-y">
            <Outlet />
          </div>
          <ProjectRightSidebar workspaceSlug={workspaceSlug} projectId={projectId} />
        </ProjectAuthWrapper>
      </div>
    </>
  );
});

export default ProjectDetailSettingsLayout;
