import { FileText, LayoutGrid } from "lucide-react";
// plane imports
import { InitiativeIcon, TeamsIcon } from "@plane/propel/icons";
import type {
  IWorkspaceDefaultSearchResult,
  IWorkspaceIssueSearchResult,
  IWorkspaceSearchResult,
  IWorkspaceInitiativeSearchResult,
  IWorkspaceTeamspaceSearchResult,
} from "@plane/types";
import { generateWorkItemLink } from "@plane/utils";
// components
import type { TPowerKSearchResultGroupDetails } from "@/components/power-k/ui/modal/search-results-map";
// plane web imports
import { IssueIdentifier } from "@/plane-web/components/issues/issue-details/issue-identifier";
// local imports
import type { TPowerKSearchResultsKeysExtended } from "../types";

type TSearchResultsGroupsMapExtended = Record<TPowerKSearchResultsKeysExtended, TPowerKSearchResultGroupDetails>;

export const SEARCH_RESULTS_GROUPS_MAP_EXTENDED: TSearchResultsGroupsMapExtended = {
  epic: {
    title: "Epics",
    itemName: (epic: IWorkspaceIssueSearchResult) => (
      <div className="flex gap-2">
        <IssueIdentifier
          projectId={epic.project_id}
          issueTypeId={epic.type_id}
          projectIdentifier={epic.project__identifier}
          issueSequenceId={epic.sequence_id}
          textContainerClassName="text-xs"
        />{" "}
        {epic.name}
      </div>
    ),
    path: (epic: IWorkspaceIssueSearchResult) =>
      generateWorkItemLink({
        workspaceSlug: epic?.workspace__slug,
        projectId: epic?.project_id,
        issueId: epic?.id,
        projectIdentifier: epic.project__identifier,
        sequenceId: epic?.sequence_id,
        isEpic: true,
      }),
  },
  team: {
    title: "Teamspaces",
    icon: TeamsIcon,
    itemName: (team: IWorkspaceTeamspaceSearchResult) => team?.name,
    path: (team: IWorkspaceTeamspaceSearchResult) => `/${team?.workspace__slug}/teamspaces/${team?.id}`,
  },
  initiative: {
    title: "Initiatives",
    icon: InitiativeIcon,
    itemName: (initiative: IWorkspaceInitiativeSearchResult) => initiative?.name,
    path: (initiative: IWorkspaceInitiativeSearchResult) =>
      `/${initiative?.workspace__slug}/initiatives/${initiative?.id}`,
  },
};

export const pagesAppCommandGroups = {
  page: {
    icon: <FileText className="size-3" />,
    itemName: (page: IWorkspaceDefaultSearchResult) => page?.name,
    path: (page: IWorkspaceDefaultSearchResult) => `/${page?.workspace__slug}/wiki/${page?.id}`,
    title: "Pages",
  },
  workspace: {
    icon: <LayoutGrid className="size-3" />,
    itemName: (workspace: IWorkspaceSearchResult) => workspace?.name,
    path: (workspace: IWorkspaceSearchResult) => `/${workspace?.slug}/wiki`,
    title: "Workspaces",
  },
};
