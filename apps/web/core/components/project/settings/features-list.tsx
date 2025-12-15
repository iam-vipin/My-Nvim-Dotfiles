import { observer } from "mobx-react";
// plane imports
import { PROJECT_TRACKER_EVENTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { setPromiseToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import type { IProject, TProjectFeatures } from "@plane/types";
// components
import { SettingsHeading } from "@/components/settings/heading";
// helpers
import { captureSuccess } from "@/helpers/event-tracker.helper";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUser } from "@/hooks/store/user";
// plane web imports
import { UpgradeBadge } from "@/plane-web/components/workspace/upgrade-badge";
import { PROJECT_FEATURES_LIST } from "@/plane-web/constants/project/settings";
import { useProjectAdvanced } from "@/plane-web/hooks/store/projects/use-projects";
import { ProjectFeatureToggle } from "./helper";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
};

export const ProjectFeaturesList = observer(function ProjectFeaturesList(props: Props) {
  const { workspaceSlug, projectId, isAdmin } = props;
  // store hooks
  const { t } = useTranslation();
  const { data: currentUser } = useUser();
  const { getProjectById, updateProject } = useProject();
  const { toggleProjectFeatures, getProjectFeatures } = useProjectAdvanced();
  // derived values
  const currentProjectDetails = getProjectById(projectId);
  const projectFeatures = getProjectFeatures(projectId);

  const handleSubmit = (featureKey: string, featureProperty: string) => {
    if (!workspaceSlug || !projectId || !currentProjectDetails) return;

    // making the request to update the project feature
    const settingsPayload = {
      [featureProperty]: !currentProjectDetails?.[featureProperty as keyof IProject],
    };
    const updateProjectPromise = updateProject(workspaceSlug, projectId, settingsPayload).then(() => {});

    const updatePromises = [updateProjectPromise];

    if (["is_milestone_enabled", "is_time_tracking_enabled"].includes(featureProperty)) {
      updatePromises.push(toggleProjectFeatures(workspaceSlug, projectId, settingsPayload));
    }

    const promises = Promise.all(updatePromises).then(() => {
      captureSuccess({
        eventName: PROJECT_TRACKER_EVENTS.feature_toggled,
        payload: {
          feature_key: featureKey,
        },
      });
    });

    setPromiseToast(promises, {
      loading: "Updating project feature...",
      success: {
        title: "Success!",
        message: () => "Project feature updated successfully.",
      },
      error: {
        title: "Error!",
        message: () => "Something went wrong while updating project feature. Please try again.",
      },
    });
    void updateProjectPromise.then(() => {
      captureSuccess({
        eventName: PROJECT_TRACKER_EVENTS.feature_toggled,
        payload: {
          feature_key: featureKey,
        },
      });
      return undefined;
    });
  };

  const isFeatureEnabled = (featureKey: string) =>
    Boolean(
      projectFeatures?.[featureKey as keyof TProjectFeatures] || currentProjectDetails?.[featureKey as keyof IProject]
    );

  if (!currentUser) return <></>;

  return (
    <div className="space-y-6">
      {Object.entries(PROJECT_FEATURES_LIST).map(([featureSectionKey, feature]) => (
        <div key={featureSectionKey} className="">
          <SettingsHeading title={t(feature.key)} description={t(`${feature.key}_description`)} />
          {Object.entries(feature.featureList).map(([featureItemKey, featureItem]) => (
            <div key={featureItemKey} className="gap-x-8 gap-y-2 border-b border-subtle bg-surface-1 py-4">
              <div key={featureItemKey} className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center rounded-sm bg-surface-2 p-3">{featureItem.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-13 font-medium leading-5">{t(featureItem.key)}</h4>
                      {featureItem.isPro && (
                        <Tooltip tooltipContent="Pro feature" position="top">
                          <UpgradeBadge className="rounded-sm" />
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-13 leading-5 tracking-tight text-tertiary">
                      {t(`${featureItem.key}_description`)}
                    </p>
                  </div>
                </div>
                <ProjectFeatureToggle
                  featureItem={featureItem}
                  value={isFeatureEnabled(featureItemKey)}
                  handleSubmit={handleSubmit}
                  disabled={!isAdmin}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});
