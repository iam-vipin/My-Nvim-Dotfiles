import { v4 as uuid } from "uuid";
import type { SlackEventPayload, SlackService } from "@plane/etl/slack";
import { logger } from "@plane/logger";
import { getConnectionDetails } from "@/apps/slack/helpers/connection-details";
import { getAccountConnectionBlocks } from "@/apps/slack/views/account-connection";
import { env } from "@/env";
import type { TAIInferenceResponse } from "./app-mention.types";

export const handleAppMentionEvent = async (data: SlackEventPayload) => {
  logger.info("Handling app mention event", { data });

  if (data.event.type !== "app_mention") {
    return;
  }

  const currentMessageTs = data.event.ts;
  const threadTs = data.event.thread_ts || null;

  if (!env.AI_SERVICE_BASE_URL) {
    logger.info("Ignoring app mention event because AI service is not configured");
    return;
  }
  const slackUserId = data.event.user;
  const connectionDetails = await getConnectionDetails(data.team_id, { id: slackUserId });
  if (!connectionDetails) {
    logger.info("Ignoring app mention event because we don't have connection details");
    return;
  }

  const { planeClient, slackService } = connectionDetails;

  if (connectionDetails.missingUserCredentials) {
    logger.warn("User didn't connect their slack account while trying mentions");
    await slackService.sendEphemeralMessage(
      slackUserId,
      "Please connect your Slack account to Plane to use this feature.",
      data.event.channel,
      undefined,
      getAccountConnectionBlocks(connectionDetails)
    );

    return;
  }

  const botUserIds = data.authorizations
    .filter((authorization) => authorization.is_bot)
    .map((authorization) => authorization.user_id);

  const userPrompt = await getUserPromptFromThread(
    slackService,
    data.event.channel,
    currentMessageTs,
    data.event.text,
    botUserIds,
    threadTs
  );

  logger.info("User prompt", { ts: currentMessageTs, team_id: data.team_id, userPrompt });

  const token = planeClient.options.bearerToken || planeClient.options.apiToken;
  if (!token) {
    logger.error("No token found for the plane client");
    return;
  }

  await slackService.addReaction(data.event.channel, data.event.ts, "eyes");

  const aiResponse = await inferResponseFromPlaneAI(token, {
    text: userPrompt,
    user_id: connectionDetails.credentials.user_id,
    workspace_id: connectionDetails.workspaceConnection.workspace_id,
  });

  await slackService.sendThreadMessage(data.event.channel, data.event.ts, mapAIResponseToSlackMessage(aiResponse));

  await slackService.removeReaction(data.event.channel, data.event.ts, "eyes");
};

const getUserPromptFromThread = async (
  slackService: SlackService,
  channel: string,
  currentMessageTs: string,
  currentMessageText: string,
  botUserIds: string[],
  threadTs: string | null
) => {
  let userPrompt = "";
  if (threadTs) {
    const threadMessages = await slackService.fetchPreviousMessagesInThread(channel, threadTs);
    userPrompt =
      "Here is the conversation history for context:" +
      "\n===================\n" +
      threadMessages
        .filter((message) => message.ts !== currentMessageTs)
        .map(
          (message) =>
            (botUserIds.includes(message.user) ? "Assistant: " : "User: ") + removeMentionFromText(message.text)
        )
        .join("\n") +
      "\n===================\n";
  }
  userPrompt += "πCurrent user messageπ:\n" + removeMentionFromText(currentMessageText);
  return userPrompt;
};

const inferResponseFromPlaneAI = async (
  token: string,
  request: { text: string; user_id: string; workspace_id: string }
) => {
  const aiRequest = {
    query: request.text,
    user_id: request.user_id,
    is_new: true,
    is_temp: false,
    workspace_id: request.workspace_id,
    workspace_in_context: true,
    context: {},
    chat_id: uuid(),
    source: "app",
    llm: "gpt-4.1",
  };

  const response = await fetch(`${env.AI_SERVICE_BASE_URL}/api/v1/chat/slack/answer/`, {
    method: "POST",
    body: JSON.stringify(aiRequest),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data: TAIInferenceResponse = await response.json();
  logger.info("Response from Plane AI", { data });
  return data;
};

const mapAIResponseToSlackMessage = (aiResponse: TAIInferenceResponse): string => {
  let responseText = aiResponse.response;
  if (aiResponse.response_type === "actions") {
    responseText = "";
    for (const action of aiResponse.context?.actions || []) {
      responseText += `${action.message} - ${action.entity.entity_url}\n`;
    }
  } else if (aiResponse.response_type === "clarification") {
    responseText = "";
    for (const question of aiResponse.clarification_data?.questions || []) {
      responseText += `- ${question}\n`;
    }
    if (aiResponse.clarification_data?.disambiguation_options) {
      responseText += "Some Suggestions:\n";
      for (const option of (aiResponse.clarification_data?.disambiguation_options || []).slice(0, 3)) {
        responseText += `- ${option.name} (${option.email})\n`;
      }
    }
  }
  return convertMarkdownToSlackFormat(responseText);
};

const convertMarkdownToSlackFormat = (text: string): string => {
  // Convert markdown bold (**text**) to Slack bold (*text*)
  let formatted = text.replace(/\*\*([^*]+)\*\*/g, "*$1*");
  // Convert markdown list items (- ) to Slack bullet points (• )
  formatted = formatted.replace(/^- /gm, "• ");
  return formatted;
};

const removeMentionFromText = (text: string) => text.replace(/<@[^>]+>/g, "");
