import type { Client } from "@plane/sdk";
import type { TWorkspaceEntityConnection } from "@plane/types";
import { getAPIClient } from "@/services/client";
import { EGitlabEntityConnectionType } from "@plane/etl/gitlab";
import { E_INTEGRATION_KEYS } from "@plane/types";
import { integrationConnectionHelper } from "@/helpers/integration-connection-helper";

export const createGitlabIssueLinkedComment = async (
  planeClient: Client,
  workspaceSlug: string,
  workspaceConnectionId: string,
  workspaceId: string,
  projectId: string,
  issueId: string,
  entityId: string,
  glIntegrationKey: E_INTEGRATION_KEYS
): Promise<TWorkspaceEntityConnection> => {
  const apiClient = getAPIClient();

  // check if already an entity connection exists for this issue link
  // else create a new comment and attach it to new entity connection
  const [issueLinkEntityConnection] = await apiClient.workspaceEntityConnection.listWorkspaceEntityConnections({
    entity_id: entityId,
    project_id: projectId,
    issue_id: issueId,
    type: EGitlabEntityConnectionType.ISSUE_LINK,
    entity_type: glIntegrationKey,
  });

  if (issueLinkEntityConnection) {
    return issueLinkEntityConnection;
  }

  const newComment = await planeClient.issueComment.create(workspaceSlug, projectId, issueId, {
    comment_html: `<p>Comments from the linked GitLab issue will be synced in this thread.</p>`,
  });

  return await integrationConnectionHelper.createOrUpdateWorkspaceEntityConnection({
    workspace_connection_id: workspaceConnectionId,
    workspace_id: workspaceId,
    entity_id: entityId,
    project_id: projectId,
    issue_id: issueId,
    type: EGitlabEntityConnectionType.ISSUE_LINK,
    entity_type: glIntegrationKey,
    config: {
      comment_id: newComment.id,
    },
  });
};
