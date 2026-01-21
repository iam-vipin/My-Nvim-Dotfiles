/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { setPromiseToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import type { IProject, TProjectFeatures } from "@plane/types";
// components
import { SettingsControlItem } from "@/components/settings/control-item";
import { SettingsHeading } from "@/components/settings/heading";
// hooks
import { useProject } from "@/hooks/store/use-project";
// plane web imports
import { UpgradeBadge } from "@/plane-web/components/workspace/upgrade-badge";
import { PROJECT_FEATURES_LIST } from "@/constants/project/settings";
import { useProjectAdvanced } from "@/plane-web/hooks/store/projects/use-projects";
// local imports
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
  const { getProjectById, updateProject } = useProject();
  const { toggleProjectFeatures, getProjectFeatures } = useProjectAdvanced();
  // derived values
  const currentProjectDetails = getProjectById(projectId);
  const projectFeatures = getProjectFeatures(projectId);

  const handleSubmit = (_featureKey: string, featureProperty: string) => {
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

    const promises = Promise.all(updatePromises);

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
      return undefined;
    });
  };

  const isFeatureEnabled = (featureKey: string) =>
    Boolean(
      projectFeatures?.[featureKey as keyof TProjectFeatures] || currentProjectDetails?.[featureKey as keyof IProject]
    );

  return (
    <>
      {Object.entries(PROJECT_FEATURES_LIST).map(([featureSectionKey, feature]) => (
        <div key={featureSectionKey}>
          <SettingsHeading title={t(feature.key)} description={t(`${feature.key}_description`)} />
          <div className="mt-6">
            {Object.entries(feature.featureList).map(([featureItemKey, featureItem]) => (
              <div key={featureItemKey} className="gap-x-8 gap-y-2 py-2 border-b border-subtle bg-surface-1">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 size-10 grid place-items-center rounded-sm bg-layer-2">
                    {featureItem.icon}
                  </div>
                  <SettingsControlItem
                    title={
                      <span className="flex items-center gap-2">
                        {t(featureItem.key)}
                        {featureItem.isPro && (
                          <Tooltip tooltipContent="Pro feature" position="top">
                            <UpgradeBadge className="rounded-sm" />
                          </Tooltip>
                        )}
                      </span>
                    }
                    description={t(`${featureItem.key}_description`)}
                    control={
                      <ProjectFeatureToggle
                        featureItem={featureItem}
                        value={isFeatureEnabled(featureItemKey)}
                        handleSubmit={handleSubmit}
                        disabled={!isAdmin}
                      />
                    }
                  />
                </div>
                <div className="pl-14">
                  {currentProjectDetails?.[featureItem.property as keyof IProject] &&
                    featureItem.renderChildren?.(currentProjectDetails, workspaceSlug)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
});
