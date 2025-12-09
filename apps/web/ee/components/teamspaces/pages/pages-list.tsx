import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
// plane imports
import {
  EUserPermissionsLevel,
  EPageAccess,
  TEAMSPACE_PAGE_TRACKER_EVENTS,
  TEAMSPACE_PAGE_TRACKER_ELEMENTS,
} from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { EUserWorkspaceRoles } from "@plane/types";
// assets
import onboardingPagesDark from "@/app/assets/empty-state/onboarding/pages-dark.webp?url";
import onboardingPagesLight from "@/app/assets/empty-state/onboarding/pages-light.webp?url";
import allFiltersDark from "@/app/assets/empty-state/wiki/all-filters-dark.svg?url";
import allFiltersLight from "@/app/assets/empty-state/wiki/all-filters-light.svg?url";
import nameFilterDark from "@/app/assets/empty-state/wiki/name-filter-dark.svg?url";
import nameFilterLight from "@/app/assets/empty-state/wiki/name-filter-light.svg?url";
// components
import { ListLayout } from "@/components/core/list";
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";
import { SimpleEmptyState } from "@/components/empty-state/simple-empty-state-root";
import { PageListBlockRoot } from "@/components/pages/list/block-root";
import { PageLoader } from "@/components/pages/loaders/page-loader";
// hooks
import { captureClick, captureError, captureSuccess } from "@/helpers/event-tracker.helper";
import { useUserPermissions } from "@/hooks/store/user";
import { useAppRouter } from "@/hooks/use-app-router";
// plane web hooks
import { EPageStoreType, usePageStore } from "@/plane-web/hooks/store";

const storeType = EPageStoreType.TEAMSPACE;

type Props = {
  teamspaceId: string;
};

export const TeamspacePagesList = observer(function TeamspacePagesList(props: Props) {
  const { teamspaceId } = props;
  // router
  const router = useAppRouter();
  const { workspaceSlug: routerWorkspaceSlug } = useParams();
  const workspaceSlug = routerWorkspaceSlug?.toString();
  // states
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { allowPermissions } = useUserPermissions();
  // plane web hooks
  const { loader, getCurrentTeamspacePageIds, getCurrentTeamspaceFilteredPageIdsByTab, filters, createPage } =
    usePageStore(EPageStoreType.TEAMSPACE);
  // derived values
  const teamspacePagesLoader = loader;
  const teamspacePageIds = getCurrentTeamspacePageIds(teamspaceId);
  const filteredTeamspacePageIds = getCurrentTeamspaceFilteredPageIdsByTab("public"); // Default to public
  const teamspacePagesFilters = filters;
  const hasWorkspaceMemberLevelPermissions = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );
  // theme hook
  const { resolvedTheme } = useTheme();
  // derived asset paths
  const allFiltersResolvedPath = resolvedTheme === "light" ? allFiltersLight : allFiltersDark;
  const nameFilterResolvedPath = resolvedTheme === "light" ? nameFilterLight : nameFilterDark;
  const generalPageResolvedPath = resolvedTheme === "light" ? onboardingPagesLight : onboardingPagesDark;
  // handlers
  const handleCreatePage = async () => {
    setIsCreatingPage(true);
    captureClick({
      elementName: TEAMSPACE_PAGE_TRACKER_ELEMENTS.EMPTY_STATE_CREATE_PAGE_BUTTON,
    });
    // Create page
    await createPage({
      access: EPageAccess.PUBLIC,
    })
      .then((res) => {
        if (res?.id) {
          const pageId = `/${workspaceSlug}/teamspaces/${teamspaceId}/pages/${res?.id}`;
          router.push(pageId);
          captureSuccess({
            eventName: TEAMSPACE_PAGE_TRACKER_EVENTS.PAGE_CREATE,
            payload: {
              id: res?.id,
              teamspaceId,
            },
          });
        }
      })
      .catch((err) => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: err?.data?.error || "Page could not be created. Please try again.",
        });
        captureError({
          eventName: TEAMSPACE_PAGE_TRACKER_EVENTS.PAGE_CREATE,
          payload: {
            teamspaceId,
          },
        });
      })
      .finally(() => {
        setIsCreatingPage(false);
      });
  };

  if (teamspacePagesLoader === "init-loader" || !teamspacePageIds || !filteredTeamspacePageIds) return <PageLoader />;

  if (filteredTeamspacePageIds.length === 0 && teamspacePageIds.length > 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        {teamspacePagesFilters?.searchQuery && teamspacePagesFilters.searchQuery.length > 0 ? (
          <SimpleEmptyState
            title={t("teamspace_pages.empty_state.search.title")}
            description={t("teamspace_pages.empty_state.search.description")}
            assetPath={nameFilterResolvedPath}
          />
        ) : (
          <SimpleEmptyState
            title={t("teamspace_pages.empty_state.filter.title")}
            description={t("teamspace_pages.empty_state.filter.description")}
            assetPath={allFiltersResolvedPath}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {filteredTeamspacePageIds.length > 0 ? (
        <div className="flex h-full w-full flex-col">
          <ListLayout>
            {filteredTeamspacePageIds.length > 0 ? (
              filteredTeamspacePageIds.map((pageId) => (
                <PageListBlockRoot key={pageId} paddingLeft={0} pageId={pageId} storeType={storeType} />
              ))
            ) : (
              <p className="mt-10 text-center text-sm text-custom-text-300">No results found</p>
            )}
          </ListLayout>
        </div>
      ) : (
        <DetailedEmptyState
          title={t("teamspace_pages.empty_state.team_page.title")}
          description={t("teamspace_pages.empty_state.team_page.description")}
          assetPath={generalPageResolvedPath}
          primaryButton={{
            text: isCreatingPage
              ? t("common.creating")
              : t("teamspace_pages.empty_state.team_page.primary_button.text"),
            onClick: handleCreatePage,
            disabled: !hasWorkspaceMemberLevelPermissions || isCreatingPage,
          }}
        />
      )}
    </>
  );
});
