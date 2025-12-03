/**
 * @overview
 * This step takes the responsibility of updating the project configuration in order
 * to ensure that the project has the necessary settings enabled before we run the import
 */

import { E_FEATURE_FLAGS } from "@plane/constants";
import { logger } from "@plane/logger";
import { createEmptyContext } from "@/apps/jira-server-importer/v2/helpers/ctx";
import type { IStep, TStepExecutionContext, TStepExecutionInput } from "@/apps/jira-server-importer/v2/types";
import { EJiraStep } from "@/apps/jira-server-importer/v2/types";
import { getPlaneFeatureFlagService } from "@/helpers/plane-api-client";

export type TRequiredFlags = {
  epics: boolean;
  issue_types: boolean;
  issue_worklog: boolean;
};

export class PlaneProjectConfigurationStep implements IStep {
  name = EJiraStep.PLANE_PROJECT_CONFIGURATION;
  dependencies: EJiraStep[] = [];

  async execute(input: TStepExecutionInput): Promise<TStepExecutionContext> {
    const { jobContext } = input;
    const { job, planeClient } = jobContext;

    const { workspace_slug, project_id } = job;

    const allFeatureFlags = await this.fetchFeatureFlags(workspace_slug, job.initiator_id);
    const requiredFlags = this.collectRequiredFlags(allFeatureFlags);

    logger.info(`[${job.id.slice(0, 7)}] Project configuration: ${JSON.stringify(requiredFlags)}`, {
      workspace_slug,
      project_id,
      requiredFlags,
    });

    // Todo, once the features api supports time tracking, we can remove this
    const result = await planeClient.project.update(workspace_slug, project_id, {
      is_time_tracking_enabled: requiredFlags.issue_worklog,
    });

    const featureUpdate = await planeClient.project.toggleProjectFeatures(workspace_slug, project_id, {
      epics: requiredFlags.epics,
      modules: true,
      cycles: true,
      work_item_types: requiredFlags.issue_types,
    });

    logger.info(`[${job.id.slice(0, 7)}] Project configuration updated:`, {
      workspace_slug,
      project_id,
      result,
      featureUpdate,
    });

    return createEmptyContext();
  }

  async fetchFeatureFlags(workspace_slug: string, user_id: string): Promise<Record<string, boolean>> {
    const flaggingService = await getPlaneFeatureFlagService();
    const allFeatureFlags = await flaggingService.getAllFeatureFlags({
      workspace_slug: workspace_slug,
      user_id: user_id,
    });
    return allFeatureFlags;
  }

  collectRequiredFlags(allFeatureFlags: Record<string, boolean>): TRequiredFlags {
    return {
      epics: allFeatureFlags[E_FEATURE_FLAGS.EPICS] || false,
      issue_types: allFeatureFlags[E_FEATURE_FLAGS.ISSUE_TYPES] || false,
      issue_worklog: allFeatureFlags[E_FEATURE_FLAGS.ISSUE_WORKLOG] || false,
    };
  }
}
