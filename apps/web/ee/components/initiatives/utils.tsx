import type { ReactElement } from "react";
// plane
import { EIconSize, INITIATIVE_STATES } from "@plane/constants";
import { InitiativeStateIcon } from "@plane/propel/icons";
import type { ISearchIssueResponse, IUserLite, TInitiativeGroupByOptions, TInitiativeStates } from "@plane/types";
import { Avatar } from "@plane/ui";
// helpers
import { getFileURL } from "@plane/utils";

// PLane-web
import { rootStore } from "@/lib/store-context";

export type TInitiativeGroup = {
  id: string;
  name: string;
  icon?: ReactElement;
};

export const getGroupList = (
  groupIds: string[],
  groupBy: TInitiativeGroupByOptions,
  getUserDetails: (userId: string) => IUserLite | undefined
) => {
  const groupList: TInitiativeGroup[] = [];

  let sortedGroupIds = groupIds;

  switch (groupBy) {
    case "state":
      sortedGroupIds = sortedGroupIds.sort(
        (a, b) =>
          INITIATIVE_STATES[a as TInitiativeStates].sortOrder - INITIATIVE_STATES[b as TInitiativeStates].sortOrder
      );
    case "label_ids":
      // Sort labels alphabetically, but "None" first
      sortedGroupIds = sortedGroupIds.sort((a, b) => {
        if (a === "None") return -1;
        if (b === "None") return 1;
        return a.localeCompare(b);
      });
      break;
    default:
      sortedGroupIds = sortedGroupIds.sort((a) => {
        if (a === "none") return -1;
        return 1;
      });
  }

  if (!groupBy) {
    for (const groupId of sortedGroupIds) {
      groupList.push({
        id: groupId,
        name: groupId,
      });
    }
  }

  if (groupBy === "created_by" || groupBy === "lead") {
    for (const groupId of sortedGroupIds) {
      if (groupId === "None") {
        groupList.push({
          id: groupId,
          name: "None",
          icon: <Avatar size="md" />,
        });
        continue;
      }

      const member = getUserDetails(groupId);

      if (!member) continue;

      groupList.push({
        id: groupId,
        name: member.display_name,
        icon: <Avatar name={member?.display_name} src={getFileURL(member?.avatar_url ?? "")} size="md" />,
      });
    }
  }

  if (groupBy === "state") {
    for (const groupId of sortedGroupIds) {
      groupList.push({
        id: groupId,
        name: INITIATIVE_STATES[groupId as TInitiativeStates].title,
        icon: <InitiativeStateIcon state={groupId as TInitiativeStates} size={EIconSize.LG} />,
      });
    }
  }

  if (groupBy === "label_ids") {
    const workspaceSlug = rootStore.router.workspaceSlug;
    const { getInitiativesLabels } = rootStore.initiativeStore;

    if (!workspaceSlug) return groupList;

    const labelsMap = getInitiativesLabels(workspaceSlug);

    for (const groupId of sortedGroupIds) {
      if (groupId === "None") {
        groupList.push({
          id: groupId,
          name: "None",
          icon: <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: "#666" }} />,
        });
        continue;
      }

      const label = labelsMap?.get(groupId);

      if (!label) continue;

      groupList.push({
        id: groupId,
        name: label.name,
        icon: <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />,
      });
    }
  }

  return groupList;
};

/**
 * Retrieves detailed epic information for selected epic IDs from stores
 * Used in initiative epic selection modals to display selected epics with complete details
 * @param selectedEpicIds - Array of epic IDs currently selected
 * @param workspaceSlug - Workspace slug identifier
 * @returns Array of epic details formatted for search/selection interfaces
 */
export const getSelectedEpicDetails = (selectedEpicIds: string[], workspaceSlug: string): ISearchIssueResponse[] => {
  const selectedEpicDetails: ISearchIssueResponse[] = [];

  // Store references for data fetching
  const issueStore = rootStore.issue.issues;
  const projectStore = rootStore.projectRoot.project;
  const projectStateStore = rootStore.state;

  selectedEpicIds.forEach((epicId) => {
    // Fetch related data from different stores
    const epicIssue = issueStore.getIssueById(epicId);
    const epicProject = projectStore.getProjectById(epicIssue?.project_id);
    const epicState = projectStateStore.getStateById(epicIssue?.state_id);

    // Skip if any required data is missing
    if (!epicIssue || !epicProject || !epicState || !epicIssue.type_id) return;

    // Construct epic details object following ISearchIssueResponse interface
    selectedEpicDetails.push({
      id: epicIssue.id,
      name: epicIssue.name,
      project_id: epicProject.id,
      project__identifier: epicProject.identifier,
      project__name: epicProject.name,
      sequence_id: epicIssue.sequence_id,
      start_date: epicIssue.start_date,
      type_id: epicIssue.type_id,
      workspace__slug: workspaceSlug,
      state__color: epicState.color,
      state__group: epicState.group,
      state__name: epicState.name,
    });
  });

  return selectedEpicDetails;
};
