import { observer } from "mobx-react";
import { useTheme } from "next-themes";
import useSWR from "swr";
// plane imports
import { useTranslation } from "@plane/i18n";
import type { IProject } from "@plane/types";
// components
import integrationsDark from "@/app/assets/empty-state/project-settings/integrations-dark.webp?url";
import integrationsLight from "@/app/assets/empty-state/project-settings/integrations-light.webp?url";
import { PageHead } from "@/components/core/page-title";
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";
import { IntegrationCard } from "@/components/project/integration-card";
import { IntegrationsSettingsLoader } from "@/components/ui/loader/settings/integration";
// assets
// fetch-keys
import { PROJECT_DETAILS, WORKSPACE_INTEGRATIONS } from "@/constants/fetch-keys";
// services
import { IntegrationService } from "@/services/integrations";
import { ProjectService } from "@/services/project";
import type { Route } from "./+types/page";

// services
const integrationService = new IntegrationService();
const projectService = new ProjectService();

function ProjectIntegrationsPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, projectId } = params;
  // plane hooks
  const { t } = useTranslation();
  // theme hook
  const { resolvedTheme } = useTheme();
  // fetch project details
  const { data: projectDetails } = useSWR<IProject>(PROJECT_DETAILS(workspaceSlug, projectId), () =>
    projectService.getProject(workspaceSlug, projectId)
  );
  // fetch Integrations list
  const { data: workspaceIntegrations } = useSWR(WORKSPACE_INTEGRATIONS(workspaceSlug), () =>
    integrationService.getWorkspaceIntegrationsList(workspaceSlug)
  );
  // derived values
  const isAdmin = projectDetails?.member_role === 20;
  const pageTitle = projectDetails?.name ? `${projectDetails?.name} - Integrations` : undefined;
  const resolvedPath = resolvedTheme === "light" ? integrationsLight : integrationsDark;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className={`w-full gap-10 overflow-y-auto py-8 pr-9 ${isAdmin ? "" : "opacity-60"}`}>
        <div className="flex items-center border-b border-subtle py-3.5">
          <h3 className="text-heading-sm-medium">Integrations</h3>
        </div>
        {workspaceIntegrations ? (
          workspaceIntegrations.length > 0 ? (
            <div>
              {workspaceIntegrations.map((integration) => (
                <IntegrationCard key={integration.integration_detail.id} integration={integration} />
              ))}
            </div>
          ) : (
            <div className="h-full w-full py-8">
              <DetailedEmptyState
                title={t("project_settings.empty_state.integrations.title")}
                description={t("project_settings.empty_state.integrations.description")}
                assetPath={resolvedPath}
              />
            </div>
          )
        ) : (
          <IntegrationsSettingsLoader />
        )}
      </div>
    </>
  );
}

export default observer(ProjectIntegrationsPage);
