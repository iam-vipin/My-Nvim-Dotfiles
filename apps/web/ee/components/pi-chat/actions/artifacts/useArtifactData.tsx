import { isEmpty } from "lodash-es";
import type { IModule, TIssue, TIssuePriorities, TPage } from "@plane/types";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import type { TArtifact, TUpdatedArtifact } from "@/plane-web/types";

// --- Hooks per type ---
export const useWorkItemData = (artifactId: string): Partial<TIssue> => {
  const {
    artifactsStore: { getArtifact, getArtifactByVersion },
  } = usePiChat();

  const originalData = getArtifact(artifactId);
  const updatedData = getArtifactByVersion(artifactId, "updated");
  const properties = originalData?.parameters?.properties;
  const projectId = originalData?.parameters?.project?.id;

  return !isEmpty(updatedData as Partial<TIssue>)
    ? (updatedData as Partial<TIssue>)
    : {
        name: originalData?.parameters?.name,
        description_html: originalData?.parameters?.description || "",
        project_id: projectId?.toString() || "",
        state_id: properties?.state?.id,
        priority: properties?.priority?.name as TIssuePriorities,
        start_date: properties?.start_date?.name || null,
        target_date: properties?.target_date?.name || null,
        assignee_ids: properties?.assignees?.map((a: { id: string }) => a.id) || [],
        label_ids: properties?.labels?.map((l: { id: string }) => l.id) || [],
        type_id: null,
        estimate_point: null,
        parent_id: null,
        cycle_id: null,
        module_ids: null,
      };
};

export const usePageData = (artifactId: string): Partial<TPage> => {
  const {
    artifactsStore: { getArtifact, getArtifactByVersion },
  } = usePiChat();

  const originalData = getArtifact(artifactId);
  const updatedData = getArtifactByVersion(artifactId, "updated");
  const parameters = originalData?.parameters;

  return !isEmpty(updatedData as Partial<TPage>)
    ? (updatedData as Partial<TPage>)
    : {
        name: parameters?.name,
        description_html: parameters?.description || parameters?.description_html || "",
        logo_props: parameters?.logo_props,
      };
};

export const useModuleData = (artifactId: string): Partial<IModule> => {
  const {
    artifactsStore: { getArtifact, getArtifactByVersion },
  } = usePiChat();

  const originalData = getArtifact(artifactId);
  const updatedData = getArtifactByVersion(artifactId, "updated");
  const parameters = originalData?.parameters;
  return !isEmpty(updatedData as Partial<IModule>)
    ? (updatedData as Partial<IModule>)
    : {
        name: parameters?.name,
        description: parameters?.description || "",
        start_date: parameters?.properties?.start_date?.name || null,
        target_date: parameters?.properties?.end_date?.name || null,
        member_ids: [],
        lead_id: null,
        status: "backlog",
      };
};

export const useTemplateData = (artifactId: string): TArtifact | undefined => {
  const {
    artifactsStore: { getArtifact },
  } = usePiChat();

  return getArtifact(artifactId);
};

export const useArtifactData = (artifactId: string, artifactType?: string): TUpdatedArtifact => {
  const issueData = useWorkItemData(artifactId);
  const templateData = useTemplateData(artifactId);
  const pageData = usePageData(artifactId);
  const moduleData = useModuleData(artifactId);
  switch (artifactType) {
    case "workitem":
      return issueData;
    case "page":
      return pageData;
    case "epic":
      return issueData;
    case "module":
      return moduleData;
    default:
      return templateData;
  }
};
