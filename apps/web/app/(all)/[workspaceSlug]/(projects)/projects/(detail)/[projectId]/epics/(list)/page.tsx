import { observer } from "mobx-react";
// components
import { PageHead } from "@/components/core/page-title";
// hooks
import { useProject } from "@/hooks/store/use-project";
// plane web components
import { ProjectEpicsLayoutRoot } from "@/plane-web/components/issues/issue-layouts/epic-layout-root";
import type { Route } from "./+types/page";

function ProjectEpicsPage({ params }: Route.ComponentProps) {
  // router
  const { projectId } = params;
  // store hooks
  const { getProjectById } = useProject();
  // derived values
  const project = getProjectById(projectId);
  const pageTitle = project?.name ? `${project?.name} - Epics` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="flex h-full w-full">
        <div className="h-full w-full overflow-hidden">
          <ProjectEpicsLayoutRoot />
        </div>
      </div>
    </>
  );
}

export default observer(ProjectEpicsPage);
