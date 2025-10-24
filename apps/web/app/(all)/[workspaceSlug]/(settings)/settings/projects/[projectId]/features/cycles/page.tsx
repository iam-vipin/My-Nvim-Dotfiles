"use client";

import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
// plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { setPromiseToast } from "@plane/propel/toast";
import { ToggleSwitch } from "@plane/ui";
// components
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { SettingsHeading } from "@/components/settings/heading";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { AutoScheduleCycles } from "@/plane-web/components/cycles/settings";
// plane web imports
import { PROJECT_BASE_FEATURES_LIST } from "@/plane-web/constants/project/settings";

const CyclesFeatureSettingsPage = observer(() => {
  const { workspaceSlug, projectId } = useParams();
  // permissions
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const canPerformProjectAdminActions = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.PROJECT);
  // project store
  const { getProjectById, updateProject } = useProject();
  const currentProjectDetails = projectId ? getProjectById(projectId.toString()) : undefined;

  if (!workspaceSlug || !projectId) return null;

  if (workspaceUserInfo && !canPerformProjectAdminActions) {
    return <NotAuthorizedView section="settings" isProjectView className="h-auto" />;
  }

  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Cycle Configuration` : undefined;

  const handleToggle = async () => {
    if (!currentProjectDetails) return;
    const payload = { cycle_view: !Boolean(currentProjectDetails.cycle_view) };
    const promise = updateProject(workspaceSlug.toString(), projectId.toString(), payload);
    setPromiseToast(promise, {
      loading: "Updating project feature...",
      success: { title: "Success!", message: () => "Project feature updated successfully." },
      error: { title: "Error!", message: () => "Something went wrong. Please try again." },
    });
  };

  const cyclesIcon = PROJECT_BASE_FEATURES_LIST.cycles.icon;

  return (
    <SettingsContentWrapper>
      <PageHead title={pageTitle} />
      <div className="mb-4">
        <Link
          href={`/${workspaceSlug}/settings/projects/${projectId}/features`}
          className="text-sm text-custom-text-300 hover:text-custom-text-200"
        >
          <div className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4 text-custom-text-300" />
            <span className="text-sm text-custom-text-300 font-bold">Back to features</span>
          </div>
        </Link>
      </div>

      <SettingsHeading
        title="Cycles"
        description="Schedule work in flexible periods that adapt to this project's unique rhythm and pace."
      />

      <div className="gap-x-8 gap-y-2 border-b border-custom-border-100 bg-custom-background-100 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center rounded bg-custom-background-90 p-3">{cyclesIcon}</div>
            <div>
              <h4 className="text-sm font-medium leading-5">Enable cycles</h4>
              <p className="text-sm leading-5 tracking-tight text-custom-text-300">Plan work in focused timeframes.</p>
            </div>
          </div>

          <ToggleSwitch
            value={Boolean(currentProjectDetails?.cycle_view)}
            onChange={handleToggle}
            disabled={!canPerformProjectAdminActions}
            size="sm"
          />
        </div>
      </div>

      {/* Auto-schedule cycles configuration */}
      {currentProjectDetails?.cycle_view && <AutoScheduleCycles />}
    </SettingsContentWrapper>
  );
});

export default CyclesFeatureSettingsPage;
