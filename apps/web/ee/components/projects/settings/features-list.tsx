import { observer } from "mobx-react";
// plane imports
import { useNavigate } from "react-router";
import type { E_FEATURE_FLAGS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { setPromiseToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import type { IProject, TProjectFeaturesList } from "@plane/types";
// components
import { cn, joinUrlPath } from "@plane/utils";
import { ProjectFeatureToggle } from "@/components/project/settings/helper";
import { SettingsHeading } from "@/components/settings/heading";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUser } from "@/hooks/store/user";
// plane web imports
import { UpgradeBadge } from "@/plane-web/components/workspace/upgrade-badge";
import { PROJECT_FEATURES_LIST } from "@/plane-web/constants/project/settings";
import { useProjectAdvanced } from "@/plane-web/hooks/store/projects/use-projects";
import { useFlag } from "@/plane-web/hooks/store/use-flag";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
  isCreateModal?: boolean;
};

export const ProjectFeaturesList = observer(function ProjectFeaturesList(props: Props) {
  const { workspaceSlug, projectId, isAdmin, isCreateModal } = props;
  // router
  const navigate = useNavigate();
  // store hooks
  const { t } = useTranslation();
  const { data: currentUser } = useUser();
  const { getProjectById, updateProject } = useProject();
  const { toggleProjectFeatures, isProjectFeatureEnabled } = useProjectAdvanced();
  // Feature flag mapping per project feature property
  const FEATURE_FLAG_BY_PROPERTY: Record<string, keyof typeof E_FEATURE_FLAGS | undefined> = {
    is_time_tracking_enabled: "ISSUE_WORKLOG",
    is_milestone_enabled: "MILESTONES",
    // Add more property-to-flag mappings here as needed
  };
  // Call hooks at top level
  const isWorklogEnabled = useFlag(workspaceSlug, "ISSUE_WORKLOG");
  const isMilestonesEnabled = useFlag(workspaceSlug, "MILESTONES");
  // Precompute known flags once
  const featureStatusByFlagKey: Partial<
    Record<keyof typeof E_FEATURE_FLAGS, { isEnabled: boolean; shouldHideIfDisabled: boolean }>
  > = {
    ISSUE_WORKLOG: {
      isEnabled: isWorklogEnabled,
      shouldHideIfDisabled: false,
    },
    MILESTONES: {
      isEnabled: isMilestonesEnabled,
      shouldHideIfDisabled: true,
    },
  };
  // derived values
  const currentProjectDetails = getProjectById(projectId);

  const FEATURES_LIST: (keyof TProjectFeaturesList)[] = ["is_milestone_enabled", "is_time_tracking_enabled"];

  const handleSubmit = async (featureKey: string, featureProperty: string) => {
    if (!workspaceSlug || !projectId || !currentProjectDetails) return;

    // making the request to update the project feature
    let settingsPayload = {
      [featureProperty]: !currentProjectDetails?.[featureProperty as keyof IProject],
    };

    // TODO: fix the type error
    // eslint-disable-next-line promise/always-return
    const updateProjectPromise = updateProject(workspaceSlug, projectId, settingsPayload).then(() => {});

    let updatePromise = updateProjectPromise;

    if (FEATURES_LIST.includes(featureProperty as keyof TProjectFeaturesList)) {
      settingsPayload = {
        [featureProperty]: !isProjectFeatureEnabled(projectId, featureProperty as keyof TProjectFeaturesList),
      };
      const toggleProjectFeaturesPromise = toggleProjectFeatures(workspaceSlug, projectId, settingsPayload);
      updatePromise = toggleProjectFeaturesPromise;
    }

    setPromiseToast(updatePromise, {
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
  };

  const isFeatureEnabled = (property: string): boolean => {
    if (FEATURES_LIST.includes(property as keyof TProjectFeaturesList)) {
      return isProjectFeatureEnabled(projectId, property as keyof TProjectFeaturesList);
    }
    return Boolean(currentProjectDetails?.[property as keyof IProject]);
  };
  if (!currentUser) return <></>;

  return (
    <div className="space-y-6">
      {Object.entries(PROJECT_FEATURES_LIST).map(([featureSectionKey, feature]) => (
        <div key={featureSectionKey} className="">
          <SettingsHeading title={t(feature.key)} description={t(`${feature.key}_description`)} />
          {Object.entries(feature.featureList).map(([featureItemKey, featureItem]) => {
            const flagKey = FEATURE_FLAG_BY_PROPERTY[featureItem.property];

            const featureStatus = flagKey ? featureStatusByFlagKey[flagKey] : undefined;

            if (featureStatus && featureStatus.shouldHideIfDisabled && !featureStatus.isEnabled) {
              return null;
            }

            const isEnabled = featureStatus ? Boolean(featureStatus.isEnabled) : true;

            return (
              <div
                key={featureItemKey}
                onClick={() => {
                  if (featureItem.href) {
                    navigate(
                      joinUrlPath(workspaceSlug, "settings", "projects", projectId, "features", featureItem.href)
                    );
                  }
                }}
                className={cn("gap-x-8 gap-y-2 border-b border-subtle bg-surface-1 py-4", {
                  "cursor-pointer": featureItem.href,
                })}
              >
                <div key={featureItemKey} className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center rounded-sm bg-layer-1 p-3">{featureItem.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-13 font-medium leading-5">{t(featureItem.key)}</h4>
                        {featureItem.isPro && (
                          <Tooltip tooltipContent="Pro feature" position="top">
                            <UpgradeBadge flag={flagKey} className="rounded" />
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
                    value={isFeatureEnabled(featureItem.property)}
                    handleSubmit={handleSubmit}
                    disabled={!isEnabled || !isAdmin}
                    isCreateModal={isCreateModal}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});
