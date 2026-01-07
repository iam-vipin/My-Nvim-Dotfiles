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

import type { GitlabMergeRequestEvent } from "@plane/etl/gitlab";
import { logger } from "@plane/logger";
import type { TGitlabWorkspaceConnection, TWorkspaceCredential } from "@plane/types";
import { E_INTEGRATION_KEYS } from "@plane/types";
import { getGitlabConnectionDetails } from "@/apps/gitlab/helpers/connection-details";
import { GitlabIntegrationService } from "@/apps/gitlab/services/gitlab.service";
import type { GitlabConnectionDetails } from "@/apps/gitlab/types";
import { getPlaneAPIClient } from "@/helpers/plane-api-client";
import { PullRequestBehaviour } from "@/lib/behaviours";
import { getAPIClient } from "@/services/client";

const apiClient = getAPIClient();

const getConnectionAndCredentials = async (
  data: GitlabMergeRequestEvent
): Promise<[GitlabConnectionDetails, TWorkspaceCredential] | null> => {
  const connectionDetails = await getGitlabConnectionDetails(data);
  if (!connectionDetails) {
    logger.error(`[GITLAB] Connection details not found for project ${data.project.id}, skipping...`);
    return null;
  }

  const credentials = await apiClient.workspaceCredential.getWorkspaceCredential(
    connectionDetails.workspaceConnection.credential_id
  );
  if (!credentials) {
    logger.error(`[GITLAB] Credentials not found for project ${data.project.id}, skipping...`);
    return null;
  }

  return [connectionDetails, credentials];
};

export const handleMergeRequest = async (data: GitlabMergeRequestEvent) => {
  const glIntegrationKey = data.isEnterprise ? E_INTEGRATION_KEYS.GITLAB_ENTERPRISE : E_INTEGRATION_KEYS.GITLAB;
  try {
    const result = await getConnectionAndCredentials(data);
    if (!result) return;

    const [{ workspaceConnection, projectConnections }, credentials] = result;

    const planeClient = await getPlaneAPIClient(credentials, glIntegrationKey);

    const refreshTokenCallback = async (access_token: string, refresh_token: string) => {
      await apiClient.workspaceCredential.createWorkspaceCredential({
        source: glIntegrationKey,
        target_access_token: credentials.target_access_token,
        source_access_token: access_token,
        source_refresh_token: refresh_token,
        workspace_id: workspaceConnection.workspace_id,
        user_id: credentials.user_id,
      });
    };

    let baseUrl: string | undefined;
    let clientId: string | undefined;
    let clientSecret: string | undefined;

    if (data.isEnterprise) {
      const appConfig = (workspaceConnection as TGitlabWorkspaceConnection).connection_data?.appConfig;
      baseUrl = appConfig?.baseUrl;
      clientId = appConfig?.clientId;
      clientSecret = appConfig?.clientSecret;
    }

    const gitlabService = new GitlabIntegrationService(
      credentials.source_access_token!,
      credentials.source_refresh_token!,
      refreshTokenCallback,
      baseUrl,
      data.project.id.toString(),
      clientId,
      clientSecret
    );

    const pullRequestBehaviour = new PullRequestBehaviour(
      glIntegrationKey,
      workspaceConnection.workspace_slug,
      gitlabService,
      planeClient,
      projectConnections || []
    );

    logger.info(`${glIntegrationKey} Handling merge request:`, { prId: data.object_attributes.iid });

    await pullRequestBehaviour.handleEvent({
      owner: data.project.path_with_namespace,
      repositoryName: data.project.name,
      pullRequestIdentifier: data.object_attributes.iid.toString(),
    });
  } catch (error: unknown) {
    logger.error(`${glIntegrationKey} Error handling merge request: ${(error as Error)?.stack}`);
    throw error;
  }
};
