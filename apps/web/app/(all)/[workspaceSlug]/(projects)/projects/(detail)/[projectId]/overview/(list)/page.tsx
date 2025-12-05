"use client";

// components
import { ProjectOverviewRoot } from "@/plane-web/components/project-overview/details/root";
import type { Route } from "./+types/page";

function ProjectOverviewPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, projectId } = params;
  return <ProjectOverviewRoot workspaceSlug={workspaceSlug} projectId={projectId} />;
}

export default ProjectOverviewPage;
