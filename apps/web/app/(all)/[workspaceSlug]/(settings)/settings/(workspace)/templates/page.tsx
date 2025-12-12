import { observer } from "mobx-react";
// plane imports
import { E_FEATURE_FLAGS, ETemplateLevel, EUserPermissionsLevel } from "@plane/constants";
// component
import { useTranslation } from "@plane/i18n";
import { EUserWorkspaceRoles } from "@plane/types";
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
// store hooks
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { SettingsHeading } from "@/components/settings/heading";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUserPermissions } from "@/hooks/store/user";
// plane web components
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import {
  CreateTemplatesButton,
  TemplatesUpgrade,
  WorkspaceTemplatesSettingsRoot,
} from "@/plane-web/components/templates/settings";
import { useFlag, useProjectTemplates, useWorkItemTemplates, usePageTemplates } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function TemplatesWorkspaceSettingsPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const { currentWorkspace } = useWorkspace();
  const { isAnyProjectTemplatesAvailable } = useProjectTemplates();
  const { isAnyWorkItemTemplatesAvailable } = useWorkItemTemplates();
  const { isAnyPageTemplatesAvailable } = usePageTemplates();
  // derived values
  const isProjectTemplatesEnabled = useFlag(workspaceSlug, "PROJECT_TEMPLATES");
  const isProjectTemplatesAvailable = isAnyProjectTemplatesAvailable(workspaceSlug);
  const isWorkItemTemplatesEnabled = useFlag(workspaceSlug, "WORKITEM_TEMPLATES");
  const isWorkItemTemplatesAvailable = isAnyWorkItemTemplatesAvailable(workspaceSlug);
  const isPageTemplatesEnabled = useFlag(workspaceSlug, "PAGE_TEMPLATES");
  const isPageTemplatesAvailable = isAnyPageTemplatesAvailable(workspaceSlug);
  const isAnyTemplatesEnabled = isProjectTemplatesEnabled || isWorkItemTemplatesEnabled || isPageTemplatesEnabled;
  const isAnyTemplatesAvailable =
    isProjectTemplatesAvailable || isWorkItemTemplatesAvailable || isPageTemplatesAvailable;
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace.name} - ${t("common.templates")}` : undefined;
  const hasAdminPermission = allowPermissions([EUserWorkspaceRoles.ADMIN], EUserPermissionsLevel.WORKSPACE);

  if (!currentWorkspace?.id) return <></>;

  if (workspaceUserInfo && !hasAdminPermission) {
    return <NotAuthorizedView section="settings" />;
  }

  return (
    <SettingsContentWrapper>
      <PageHead title={pageTitle} />
      <SettingsHeading
        title={t("workspace_settings.settings.templates.heading")}
        description={t("workspace_settings.settings.templates.description")}
        appendToRight={
          <>
            {isAnyTemplatesEnabled && isAnyTemplatesAvailable && hasAdminPermission && (
              <CreateTemplatesButton
                workspaceSlug={workspaceSlug}
                currentLevel={ETemplateLevel.WORKSPACE}
                buttonSize="sm"
                variant="settings"
              />
            )}
          </>
        }
      />
      <WithFeatureFlagHOC
        flag={E_FEATURE_FLAGS.WORKITEM_TEMPLATES}
        fallback={<TemplatesUpgrade flag={E_FEATURE_FLAGS.WORKITEM_TEMPLATES} />}
        workspaceSlug={workspaceSlug}
      >
        <WorkspaceTemplatesSettingsRoot workspaceSlug={workspaceSlug} />
      </WithFeatureFlagHOC>
    </SettingsContentWrapper>
  );
}

export default observer(TemplatesWorkspaceSettingsPage);
