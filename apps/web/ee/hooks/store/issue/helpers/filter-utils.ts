import type { IIssueDisplayFilterOptions } from "@plane/types";
import { store } from "@/lib/store-context";

export const getEnabledDisplayFilters = (displayFilters: IIssueDisplayFilterOptions) => {
  const { projectId, workspaceSlug } = store.router;

  if (!projectId || !workspaceSlug) return displayFilters;

  const { isMilestonesEnabled } = store.milestone;

  const isMilestonesFeatureEnabled = isMilestonesEnabled(workspaceSlug.toString(), projectId.toString());

  const FEATURES_STATUS_MAP: Record<string, boolean> = {
    milestone: isMilestonesFeatureEnabled,
  };

  const enabledDisplayFilters: IIssueDisplayFilterOptions = {
    ...displayFilters,
    group_by: displayFilters.group_by
      ? FEATURES_STATUS_MAP[displayFilters.group_by]
        ? displayFilters.group_by
        : null
      : null,
    sub_group_by: displayFilters.sub_group_by
      ? FEATURES_STATUS_MAP[displayFilters.sub_group_by]
        ? displayFilters.sub_group_by
        : null
      : null,
  };

  return enabledDisplayFilters;
};
