import type { HocusPocusServerContext, TDocumentTypes } from "@/types";
// services
import { AgentPageService } from "./agent.service";
import { ProjectPageService } from "./project-page.service";
import { TeamspacePageService } from "./teamspace-page.service";
import { WorkspacePageService } from "./workspace-page.service";

export const getPageService = (documentType: TDocumentTypes, context: HocusPocusServerContext) => {
  if (documentType === "project_page") {
    return new ProjectPageService({
      workspaceSlug: context.workspaceSlug,
      projectId: context.projectId,
      cookie: context.cookie,
    });
  }

  if (documentType === "teamspace_page") {
    return new TeamspacePageService({
      workspaceSlug: context.workspaceSlug,
      teamspaceId: context.teamspaceId,
      cookie: context.cookie,
    });
  }

  if (documentType === "workspace_page") {
    return new WorkspacePageService({
      workspaceSlug: context.workspaceSlug,
      cookie: context.cookie,
    });
  }

  if (documentType === "server_agent" || documentType === "sync_agent") {
    return new AgentPageService();
  }

  throw new Error(`Invalid document type ${documentType} provided.`);
};
