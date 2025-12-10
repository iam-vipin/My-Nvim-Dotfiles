import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { InitiativeIcon } from "@plane/propel/icons";
import { EUserWorkspaceRoles } from "@plane/types";
// ui
import { Breadcrumbs, Header } from "@plane/ui";
// components
import { LayoutSwitcher } from "@/components/base-layouts/layout-switcher";
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useUserPermissions } from "@/hooks/store/user";
import { useAppRouter } from "@/hooks/use-app-router";
// Plane-web
import { InitiativesFiltersToggle } from "@/plane-web/components/initiatives/components/rich-filters/toggle";
import { HeaderFilters } from "@/plane-web/components/initiatives/header/filters";
import { DEFAULT_INITIATIVE_LAYOUT } from "@/plane-web/constants/initiative";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";

export const InitiativesListHeader = observer(function InitiativesListHeader() {
  // router
  const router = useAppRouter();
  const { workspaceSlug } = useParams();
  const { toggleCreateInitiativeModal } = useCommandPalette();
  const {
    initiativeFilters: { currentInitiativeDisplayFilters, updateDisplayFilters },
  } = useInitiatives();

  const displayFilters = currentInitiativeDisplayFilters;
  const activeLayout = displayFilters.layout;

  const { allowPermissions } = useUserPermissions();

  const { t } = useTranslation();

  const canUserCreateInitiative = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  return (
    <>
      <Header>
        <Header.LeftItem>
          <Breadcrumbs onBack={() => router.back()}>
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink label={t("initiatives.label")} icon={<InitiativeIcon className="h-4 w-4" />} />
              }
            />
          </Breadcrumbs>
        </Header.LeftItem>
        <Header.RightItem>
          <div className="hidden gap-3 md:flex">
            <LayoutSwitcher
              selectedLayout={activeLayout || DEFAULT_INITIATIVE_LAYOUT}
              onChange={(layout) => updateDisplayFilters(workspaceSlug.toString(), { layout })}
            />
            <InitiativesFiltersToggle />
            <HeaderFilters workspaceSlug={workspaceSlug.toString()} />
          </div>
          {canUserCreateInitiative ? (
            <Button onClick={() => toggleCreateInitiativeModal({ isOpen: true, initiativeId: undefined })} size="sm">
              <div className="hidden sm:block">{t("add")}</div> {t("initiatives.label")}
            </Button>
          ) : (
            <></>
          )}
        </Header.RightItem>
      </Header>
    </>
  );
});
