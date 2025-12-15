import smoothScrollIntoView from "smooth-scroll-into-view-if-needed";
import { CycleIcon, ModuleIcon, LayersIcon, PageIcon, ViewsIcon } from "@plane/propel/icons";
import { IssueIdentifier } from "../issues/issue-details/issue-identifier";
import type { TSearchResults, TWorkspaceSearchResultItem } from "@plane/types";

export const parseDataStream = (dataStream: string) =>
  // Split the input by newline and filter out lines that start with 'data: '
  dataStream
    .split("\n") // Split input into lines
    .filter((line) => line.startsWith("data: ")) // Keep only lines that start with 'data: '
    .map((line) => line.replace("data: ", "")) // Remove the 'data: ' prefix
    .join("") // Join all characters into a single string
    .replace("[DONE]", "");

export const scrollIntoViewHelper = async (elementId: string) => {
  const sourceElementId = elementId ?? "";
  const sourceElement = document.getElementById(sourceElementId);
  if (sourceElement) await smoothScrollIntoView(sourceElement, { behavior: "smooth", block: "center", duration: 1500 });
};

export const getIcon = (type: string, item?: Partial<TWorkspaceSearchResultItem>) => {
  switch (type) {
    case "issue":
      if (!item) return <LayersIcon className="w-4 h-4" />;
      return (
        <IssueIdentifier
          issueTypeId={item.type_id}
          projectId={item.project_id || ""}
          projectIdentifier={item.project__identifier || ""}
          issueSequenceId={item.sequence_id || ""}
          size="xs"
          variant="secondary"
        />
      );
    case "cycle":
      return <CycleIcon className="w-4 h-4" />;
    case "module":
      return <ModuleIcon className="w-4 h-4" />;
    case "page":
      return <PageIcon className="w-4 h-4" />;
    case "view":
      return <ViewsIcon className="w-4 h-4" />;
    default:
      return <LayersIcon className="w-4 h-4" />;
  }
};

export const formatSearchQuery = (data: Partial<TSearchResults>): TSearchResults => {
  const parsedResponse: TSearchResults = {
    cycle: [],
    module: [],
    page: [],
    issue: [],
  };
  Object.keys(data).forEach((type) => {
    parsedResponse[type] = data[type]?.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.name,
      subTitle: type === "issue" ? `${item.project__identifier}-${item.sequence_id}` : undefined,
      icon: getIcon(type, item),
    }));
  });
  return parsedResponse;
};
