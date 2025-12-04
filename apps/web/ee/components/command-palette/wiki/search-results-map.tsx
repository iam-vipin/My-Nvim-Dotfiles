"use client";

import { FileText, LayoutGrid } from "lucide-react";
// plane imports
import type { IWorkspaceDefaultSearchResult, IWorkspaceSearchResult } from "@plane/types";
// components
import type { TPowerKSearchResultGroupDetails } from "@/components/power-k/ui/modal/search-results-map";
// local imports
import type { TWikiAppPowerKSearchResultsKeys } from "./types";

export const WIKI_APP_POWER_K_SEARCH_RESULTS_GROUPS_MAP: Record<
  TWikiAppPowerKSearchResultsKeys,
  TPowerKSearchResultGroupDetails
> = {
  page: {
    icon: FileText,
    itemName: (page: IWorkspaceDefaultSearchResult) => page?.name,
    path: (page: IWorkspaceDefaultSearchResult) => `/${page?.workspace__slug}/wiki/${page?.id}`,
    title: "Pages",
  },
  workspace: {
    icon: LayoutGrid,
    itemName: (workspace: IWorkspaceSearchResult) => workspace?.name,
    path: (workspace: IWorkspaceSearchResult) => `/${workspace?.slug}/wiki`,
    title: "Workspaces",
  },
};
