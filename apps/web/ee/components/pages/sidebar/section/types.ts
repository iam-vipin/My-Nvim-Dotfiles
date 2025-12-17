import type { Dispatch, RefObject, SetStateAction } from "react";
import type { LucideIcon } from "lucide-react";
// plane imports
import type { ISvgIcons } from "@plane/propel/icons";
import type { TPageNavigationTabs } from "@plane/types";

// Basic section details type
export type SectionDetails = {
  label: string;
  icon: LucideIcon | React.FC<ISvgIcons>;
};

// Map of section types to details
export type SectionDetailsMap = {
  [key in TPageNavigationTabs]: SectionDetails;
};

// Props for section header
export interface SectionHeaderProps {
  sectionType: TPageNavigationTabs;
  sectionDetails: SectionDetails;
  isCreatingPage: TPageNavigationTabs | null;
  handleCreatePage: (pageType: TPageNavigationTabs) => void;
  buttonRef?: RefObject<HTMLButtonElement>;
  onButtonClick?: () => void;
}

// Props for section content
export interface SectionContentProps {
  pageIds: string[];
  sectionType: TPageNavigationTabs;
  expandedPageIds?: string[];
  setExpandedPageIds?: Dispatch<SetStateAction<string[]>>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

// Props for main section component
export interface SectionRootProps {
  currentPageId?: string;
  expandedPageIds?: string[];
  sectionType: TPageNavigationTabs;
  setExpandedPageIds?: Dispatch<SetStateAction<string[]>>;
}

// Return type for drag and drop hook
export interface DragAndDropHookReturn {
  isDropping: boolean;
}
