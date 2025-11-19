import { mutate } from "swr";
import {
  PROJECT_ALL_CYCLES,
  PROJECT_ESTIMATES,
  PROJECT_STATES,
  PROJECT_MEMBERS,
  PROJECT_LABELS,
  PROJECT_VIEWS,
  PROJECT_WORKFLOWS,
  PROJECT_MODULES,
  WORK_ITEM_TYPES_PROPERTIES_AND_OPTIONS,
  EPICS_PROPERTIES_AND_OPTIONS,
  WORKSPACE_PARTIAL_PROJECTS,
  WORKSPACE_PROJECTS_ROLES_INFORMATION,
} from "@/constants/fetch-keys";

export const revalidateProjectData = (workspaceSlug: string, entities: string[], projectId?: string) => {
  const entitySet = new Set(entities);
  if (entitySet.has("project")) {
    mutate(WORKSPACE_PROJECTS_ROLES_INFORMATION(workspaceSlug));
    mutate(WORKSPACE_PARTIAL_PROJECTS(workspaceSlug));
  }
  if (!projectId) return;
  if (entitySet.has("module")) {
    mutate(PROJECT_MODULES(workspaceSlug, projectId));
  }
  if (entitySet.has("cycle")) {
    mutate(PROJECT_ALL_CYCLES(workspaceSlug, projectId));
  }
  if (entitySet.has("estimate")) {
    mutate(PROJECT_ESTIMATES(workspaceSlug, projectId));
  }
  if (entitySet.has("view")) {
    mutate(PROJECT_VIEWS(workspaceSlug, projectId));
  }
  if (entitySet.has("workflow")) {
    mutate(PROJECT_WORKFLOWS(workspaceSlug, projectId));
  }
  if (entitySet.has("label")) {
    mutate(PROJECT_LABELS(workspaceSlug, projectId));
  }
  if (entitySet.has("member")) {
    mutate(PROJECT_MEMBERS(workspaceSlug, projectId));
  }
  if (entitySet.has("state")) {
    mutate(PROJECT_STATES(workspaceSlug, projectId));
  }
  if (entitySet.has("workitem") || entitySet.has("epic")) {
    mutate(WORK_ITEM_TYPES_PROPERTIES_AND_OPTIONS(workspaceSlug, projectId));
    mutate(EPICS_PROPERTIES_AND_OPTIONS(workspaceSlug, projectId));
  }
};
