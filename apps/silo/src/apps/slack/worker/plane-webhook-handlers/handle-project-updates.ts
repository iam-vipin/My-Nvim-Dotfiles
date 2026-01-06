import { E_SLACK_ENTITY_TYPE, E_SLACK_PROJECT_UPDATES_EVENTS } from "@plane/etl/slack";
import type { TSlackProjectUpdatesConfig } from "@plane/etl/slack";
import { logger } from "@plane/logger";
import type { PlaneWebhookPayload } from "@plane/sdk";
import { getAPIClient } from "@/services/client";
import { getConnectionDetails } from "../../helpers/connection-details";
import { enhanceUserMapWithSlackLookup, getSlackToPlaneUserMapFromWC } from "../../helpers/user";
import { createSlackLinkback } from "../../views/issue-linkback";
import type { TWorkspaceEntityConnection } from "@plane/types";
import { integrationConnectionHelper } from "@/helpers/integration-connection-helper";

const apiClient = getAPIClient();

export const handleProjectUpdateWebhook = async (payload: PlaneWebhookPayload) => {
  let entityConnections = await apiClient.workspaceEntityConnection.listWorkspaceEntityConnections({
    workspace_id: payload.workspace,
    project_id: payload.project,
    entity_type: E_SLACK_ENTITY_TYPE.SLACK_PROJECT_UPDATES,
  });

  if (entityConnections.length === 0) {
    logger.info("No entity connection found for project update webhook");
    return;
  }

  entityConnections = await updateEntityConnectionsForSubscribedEvents(entityConnections);

  const workspaceConnection = await apiClient.workspaceConnection.getWorkspaceConnection(
    entityConnections[0].workspace_connection_id
  );

  if (!workspaceConnection) {
    logger.info("No workspace connection found for project update webhook");
    return;
  }

  const details = await getConnectionDetails(workspaceConnection.connection_id);

  if (!details) {
    logger.info("No details found for project update webhook");
    return;
  }

  const { slackService, planeClient } = details;

  const issue = await planeClient.issue.getIssueWithFields(
    workspaceConnection.workspace_slug,
    payload.project,
    payload.id,
    ["state", "project", "assignees", "labels", "created_by", "updated_by"]
  );

  const userMap = getSlackToPlaneUserMapFromWC(workspaceConnection);
  const enhancedUserMap = await enhanceUserMapWithSlackLookup({
    planeUsers: issue.assignees,
    currentUserMap: userMap,
    slackService,
  });

  const linkback = createSlackLinkback(workspaceConnection.workspace_slug, issue, enhancedUserMap, false);

  await Promise.all(
    entityConnections.map(async (entityConnection) => {
      // Get the channel id and project id from the entity connection
      const channelId = entityConnection.entity_id;
      const config = entityConnection.config as TSlackProjectUpdatesConfig;
      const subscribedEvents = config.subscribedEvents as E_SLACK_PROJECT_UPDATES_EVENTS[];

      if (!subscribedEvents) {
        logger.warn(
          "[SLACK PROJECT UPDATES] Subscribed Events not found for entity connection, assertion failed",
          entityConnection
        );
      }

      const shouldPostUpdate = subscribedEvents.includes(E_SLACK_PROJECT_UPDATES_EVENTS.NEW_WORK_ITEM_CREATED);

      if (shouldPostUpdate) {
        const response = await slackService.sendMessageToChannel(channelId!, {
          blocks: linkback.blocks,
          text: "New work item created in Plane",
        });

        logger.info("Project update webhook sent", response);
      } else {
        logger.info(
          "[Slack Project Updates] No Update Posted for entity connection, event not subscribed",
          entityConnection
        );
      }
    })
  );
};

const updateEntityConnectionsForSubscribedEvents = (
  entityConnections: TWorkspaceEntityConnection<TSlackProjectUpdatesConfig>[]
) => {
  const updatePromises = entityConnections.map(async (connection) => {
    const config = connection.config;
    if (!config.subscribedEvents) {
      return await integrationConnectionHelper.updateWorkspaceEntityConnection({
        entity_connection_id: connection.id,
        config: {
          subscribedEvents: [E_SLACK_PROJECT_UPDATES_EVENTS.NEW_WORK_ITEM_CREATED],
        },
      });
    }

    return connection;
  });

  return Promise.all(updatePromises);
};
