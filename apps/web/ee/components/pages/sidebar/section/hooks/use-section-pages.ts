import { useCallback } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import type { TPageNavigationTabs } from "@plane/types";
import { EPageStoreType, usePageStore } from "@/plane-web/hooks/store";

/**
 * Hook for fetching pages by section type with pagination support
 * @param sectionType Type of the section (public, private, archived, shared)
 * @returns Object containing loading state, pagination info, and fetchNextPage function
 */
export const useSectionPages = (sectionType: TPageNavigationTabs) => {
  const { workspaceSlug } = useParams();
  const { fetchPagesByType, getPaginationInfo, getPaginationLoader } = usePageStore(EPageStoreType.WORKSPACE);

  const { isLoading } = useSWR(
    workspaceSlug ? `WORKSPACE_PAGES_${workspaceSlug}_${sectionType}` : null,
    workspaceSlug ? () => fetchPagesByType(sectionType) : null,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
    }
  );

  // Get pagination info for this section
  const paginationInfo = getPaginationInfo(sectionType);
  const paginationLoader = getPaginationLoader(sectionType);

  // Function to fetch next page
  const fetchNextPage = useCallback(() => {
    if (!workspaceSlug || !paginationInfo.hasNextPage || paginationLoader === "pagination") {
      return;
    }
    // Use fetchPagesByType directly with the cursor from pagination info
    fetchPagesByType(sectionType, undefined, paginationInfo.nextCursor ?? undefined);
  }, [
    workspaceSlug,
    paginationInfo.hasNextPage,
    paginationInfo.nextCursor,
    paginationLoader,
    fetchPagesByType,
    sectionType,
  ]);

  return {
    isLoading,
    hasNextPage: paginationInfo.hasNextPage,
    isFetchingNextPage: paginationLoader === "pagination",
    fetchNextPage,
  };
};
