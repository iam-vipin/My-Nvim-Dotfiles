import { observer } from "mobx-react";
// plane imports
import { E_FEATURE_FLAGS, ETemplateLevel, EUserPermissionsLevel } from "@plane/constants";
// component
import { useTranslation } from "@plane/i18n";
import { EUserProjectRoles } from "@plane/types";
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
// store hooks
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { SettingsHeading } from "@/components/settings/heading";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
// plane web components
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import {
  CreateTemplatesButton,
  TemplatesUpgrade,
  ProjectTemplatesSettingsRoot,
} from "@/plane-web/components/templates/settings";
import { useFlag, usePageTemplates, useWorkItemTemplates } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function TemplatesProjectSettingsPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, projectId } = params;
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const { getProjectById } = useProject();
  const { isAnyWorkItemTemplatesAvailableForProject } = useWorkItemTemplates();
  const { isAnyPageTemplatesAvailableForProject } = usePageTemplates();
  // derived values
  const isWorkItemTemplatesEnabled = useFlag(workspaceSlug, "WORKITEM_TEMPLATES");
  const isPageTemplatesEnabled = useFlag(workspaceSlug, "PAGE_TEMPLATES");
  const isWorkItemTemplatesAvailableForProject = isAnyWorkItemTemplatesAvailableForProject(workspaceSlug, projectId);
  const isPageTemplatesAvailableForProject = isAnyPageTemplatesAvailableForProject(workspaceSlug, projectId);
  const isAnyTemplatesEnabled = isWorkItemTemplatesEnabled || isPageTemplatesEnabled;
  const isAnyTemplatesAvailableForProject =
    isWorkItemTemplatesAvailableForProject || isPageTemplatesAvailableForProject;
  const currentProjectDetails = getProjectById(projectId);
  const pageTitle = currentProjectDetails?.name
    ? `${currentProjectDetails.name} - ${t("common.templates")}`
    : undefined;
  const hasAdminPermission = allowPermissions([EUserProjectRoles.ADMIN], EUserPermissionsLevel.PROJECT);
  const hasMemberLevelPermission = allowPermissions(
    [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  if (!currentProjectDetails?.id) return <></>;

  if (workspaceUserInfo && !hasMemberLevelPermission) {
    return <NotAuthorizedView section="settings" isProjectView />;
  }

  return (
    <SettingsContentWrapper>
      <PageHead title={pageTitle} />
      <SettingsHeading
        title={t("project_settings.templates.heading")}
        description={t("project_settings.templates.description")}
        showButton={isAnyTemplatesEnabled && isAnyTemplatesAvailableForProject && hasAdminPermission}
        customButton={
          <CreateTemplatesButton
            workspaceSlug={workspaceSlug}
            projectId={projectId}
            currentLevel={ETemplateLevel.PROJECT}
            buttonSize="base"
            variant="settings"
          />
        }
      />
      <WithFeatureFlagHOC
        flag={E_FEATURE_FLAGS.WORKITEM_TEMPLATES}
        fallback={<TemplatesUpgrade flag={E_FEATURE_FLAGS.WORKITEM_TEMPLATES} />}
        workspaceSlug={workspaceSlug}
      >
        <ProjectTemplatesSettingsRoot workspaceSlug={workspaceSlug} projectId={projectId} />
      </WithFeatureFlagHOC>
    </SettingsContentWrapper>
  );
}

export default observer(TemplatesProjectSettingsPage);
