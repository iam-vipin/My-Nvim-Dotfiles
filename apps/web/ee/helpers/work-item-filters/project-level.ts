// ce imports
import { EIssuesStoreType } from "@plane/types";
import {
  getAdditionalProjectLevelFiltersHOCProps as getCoreAdditionalProjectLevelFiltersHOCProps,
  TGetAdditionalPropsForProjectLevelFiltersHOC,
} from "@/ce/helpers/work-item-filters/project-level";
// store imports
import { store } from "@/lib/store-context";

export const getAdditionalProjectLevelFiltersHOCProps: TGetAdditionalPropsForProjectLevelFiltersHOC = (params) => {
  const { entityType, workspaceSlug, projectId } = params;
  // derived values
  const isWorkItemTypeEnabled = store.issueTypes.isWorkItemTypeEnabledForProject(workspaceSlug, projectId);
  const isEpicEnabled = store.issueTypes.isEpicEnabledForProject(workspaceSlug, projectId);
  const projectWorkItemTypeIds = store.issueTypes.getProjectIssueTypeIds(projectId);
  let customPropertyIds: string[] | undefined = undefined;

  // Get custom property IDs based on entity type and feature flags
  if (entityType === EIssuesStoreType.EPIC && isEpicEnabled) {
    // Get epic custom property IDs
    const epicProperties = store.issueTypes.getProjectEpicDetails(projectId)?.properties;
    customPropertyIds = epicProperties?.map((property) => property.id).filter((propertyId) => propertyId !== undefined);
  } else if (isWorkItemTypeEnabled) {
    // Get work item type custom property IDs across all project work item types
    customPropertyIds = projectWorkItemTypeIds
      .flatMap((issueTypeId) => store.issueTypes.getIssueTypeProperties(issueTypeId).map((property) => property.id))
      .filter((propertyId) => propertyId !== undefined);
  }

  return {
    ...getCoreAdditionalProjectLevelFiltersHOCProps({ entityType, workspaceSlug, projectId }),
    workItemTypeIds: isWorkItemTypeEnabled ? projectWorkItemTypeIds : undefined,
    customPropertyIds: customPropertyIds,
  };
};
