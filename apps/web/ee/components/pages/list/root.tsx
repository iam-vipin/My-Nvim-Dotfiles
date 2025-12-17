import { useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import useSWR from "swr";
// plane imports
import { EUserPermissionsLevel, EPageAccess, WORKSPACE_PAGE_TRACKER_EVENTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { EUserWorkspaceRoles } from "@plane/types";
import type { TPage, TPageNavigationTabs } from "@plane/types";
import allFiltersDark from "@/app/assets/empty-state/wiki/all-filters-dark.svg?url";
import allFiltersLight from "@/app/assets/empty-state/wiki/all-filters-light.svg?url";
import nameFilterDark from "@/app/assets/empty-state/wiki/name-filter-dark.svg?url";
import nameFilterLight from "@/app/assets/empty-state/wiki/name-filter-light.svg?url";
import { PageListBlockRoot } from "@/components/pages/list/block-root";
import { PageLoader } from "@/components/pages/loaders/page-loader";
// hooks
import { captureError, captureSuccess } from "@/helpers/event-tracker.helper";
import { useUserPermissions } from "@/hooks/store/user";
import { useAppRouter } from "@/hooks/use-app-router";
import useDebounce from "@/hooks/use-debounce";
// plane web hooks
import { EPageStoreType, usePageStore } from "@/plane-web/hooks/store";

type Props = {
  pageType: TPageNavigationTabs;
};

export const WikiPagesListLayoutRoot = observer(function WikiPagesListLayoutRoot(props: Props) {
  const { pageType } = props;
  const { workspaceSlug } = useParams();
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  // theme hook
  const { resolvedTheme } = useTheme();
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { allowPermissions } = useUserPermissions();
  const pageStore = usePageStore(EPageStoreType.WORKSPACE);
  const {
    filters,
    fetchPagesByType,
    filteredPublicPageIds,
    filteredArchivedPageIds,
    filteredPrivatePageIds,
    filteredSharedPageIds,
    createPage,
  } = pageStore;
  // params
  const router = useAppRouter();
  // Debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);
  // derived values
  const resolvedAllFiltersImage = resolvedTheme === "light" ? allFiltersLight : allFiltersDark;
  const resolvedNameFilterImage = resolvedTheme === "light" ? nameFilterLight : nameFilterDark;

  // Use SWR to fetch the data but not for rendering
  const { isLoading, data } = useSWR(
    workspaceSlug ? `WORKSPACE_PAGES_${workspaceSlug}_${pageType}_${debouncedSearchQuery || ""}` : null,
    workspaceSlug ? () => fetchPagesByType(pageType, debouncedSearchQuery) : null,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
    }
  );

  // Get the appropriate page IDs based on page type
  const pageIds = useMemo(() => {
    // If there's a search query, use the search results
    if (debouncedSearchQuery) {
      return (data?.map((page) => page.id).filter(Boolean) as string[]) || [];
    }
    switch (pageType) {
      case "public":
        return filteredPublicPageIds;
      case "private":
        return filteredPrivatePageIds;
      case "archived":
        return filteredArchivedPageIds;
      case "shared":
        return filteredSharedPageIds;
      default:
        return [];
    }
  }, [
    pageType,
    filteredPublicPageIds,
    filteredPrivatePageIds,
    filteredArchivedPageIds,
    filteredSharedPageIds,
    data,
    debouncedSearchQuery,
  ]);

  // derived values - memoized for performance
  const hasWorkspaceMemberLevelPermissions = useMemo(
    () => allowPermissions([EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER], EUserPermissionsLevel.WORKSPACE),
    [allowPermissions]
  );

  if (isLoading) return <PageLoader />;
  const handleCreatePage = async () => {
    setIsCreatingPage(true);
    const payload: Partial<TPage> = {
      access: pageType === "private" ? EPageAccess.PRIVATE : EPageAccess.PUBLIC,
    };

    await createPage(payload)
      .then((res) => {
        if (res?.id) {
          captureSuccess({
            eventName: WORKSPACE_PAGE_TRACKER_EVENTS.create,
            payload: {
              id: res?.id,
              state: "SUCCESS",
            },
          });
          const pageId = `/${workspaceSlug}/wiki/${res?.id}`;
          router.push(pageId);
        }
      })
      .catch((err) => {
        captureError({
          eventName: WORKSPACE_PAGE_TRACKER_EVENTS.create,
          payload: {
            state: "ERROR",
            error: err?.data?.error,
          },
        });
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err?.data?.error || "Page could not be created. Please try again.",
        });
      })
      .finally(() => setIsCreatingPage(false));
  };
  // if no pages exist in the active page type
  if (!pageIds || pageIds.length === 0) {
    if (pageType === "public")
      return (
        <EmptyStateDetailed
          assetKey="page"
          title={t("workspace_pages.empty_state.public.title")}
          description={t("workspace_pages.empty_state.public.description")}
          actions={[
            {
              label: isCreatingPage
                ? t("common.creating")
                : t("workspace_pages.empty_state.public.primary_button.text"),
              onClick: handleCreatePage,
              disabled: !hasWorkspaceMemberLevelPermissions || isCreatingPage,
              variant: "primary",
            },
          ]}
        />
      );
    if (pageType === "private")
      return (
        <EmptyStateDetailed
          assetKey="page"
          title={t("workspace_pages.empty_state.private.title")}
          description={t("workspace_pages.empty_state.private.description")}
          actions={[
            {
              label: isCreatingPage
                ? t("common.creating")
                : t("workspace_pages.empty_state.private.primary_button.text"),
              onClick: handleCreatePage,
              disabled: !hasWorkspaceMemberLevelPermissions || isCreatingPage,
              variant: "primary",
            },
          ]}
        />
      );
    if (pageType === "archived")
      return (
        <EmptyStateDetailed
          assetKey="page"
          title={t("workspace_pages.empty_state.archived.title")}
          description={t("workspace_pages.empty_state.archived.description")}
        />
      );
    if (pageType === "shared")
      return (
        <EmptyStateDetailed
          assetKey="page"
          title="No shared pages"
          description="Pages shared with you will appear here when someone shares them."
        />
      );

    // General empty state when no pages are found
    return (
      <EmptyStateDetailed
        assetKey="page"
        title={t("workspace_pages.empty_state.general.title")}
        description={t("workspace_pages.empty_state.general.description")}
        actions={[
          {
            label: isCreatingPage ? t("common.creating") : t("workspace_pages.empty_state.general.primary_button.text"),
            onClick: handleCreatePage,
            disabled: !hasWorkspaceMemberLevelPermissions || isCreatingPage,
            variant: "primary",
          },
        ]}
      />
    );
  }

  // if no pages match the filter criteria
  if (debouncedSearchQuery && pageIds.length === 0)
    return (
      <div className="h-full w-full grid place-items-center">
        <div className="text-center">
          <img
            src={debouncedSearchQuery.length > 0 ? resolvedNameFilterImage : resolvedAllFiltersImage}
            className="h-36 sm:h-48 w-36 sm:w-48 mx-auto"
            alt="No matching pages"
          />
          <h5 className="text-18 font-medium mt-7 mb-1">No matching pages</h5>
          <p className="text-placeholder text-14">
            {debouncedSearchQuery.length > 0
              ? "Remove the search criteria to see all pages"
              : "Remove the filters to see all pages"}
          </p>
        </div>
      </div>
    );

  return (
    <div className="size-full overflow-y-scroll vertical-scrollbar scrollbar-sm">
      {pageIds.map((pageId) => (
        <PageListBlockRoot
          key={pageId}
          pageId={pageId}
          storeType={EPageStoreType.WORKSPACE}
          pageType={pageType}
          paddingLeft={0}
          sectionType={pageType}
        />
      ))}
    </div>
  );
});
