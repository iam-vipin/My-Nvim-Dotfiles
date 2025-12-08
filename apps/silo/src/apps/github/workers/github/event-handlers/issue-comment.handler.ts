import type { GithubWebhookPayload, WebhookGitHubComment } from "@plane/etl/github";
import { EGithubEntityConnectionType } from "@plane/etl/github";
import { logger } from "@plane/logger";
import type { ExIssueComment, Client as PlaneClient } from "@plane/sdk";
import type { TGithubEntityConnection, TGithubWorkspaceConnection, TWorkspaceCredential } from "@plane/types";
import { E_INTEGRATION_KEYS } from "@plane/types";
import { getGithubService } from "@/apps/github/helpers";
import { getConnDetailsForGithubToPlaneSync } from "@/apps/github/helpers/helpers";
import { transformGitHubComment } from "@/apps/github/helpers/transform";
import { env } from "@/env";
import { integrationConnectionHelper } from "@/helpers/integration-connection-helper";
import { getPlaneAPIClient } from "@/helpers/plane-api-client";
import type { Store } from "@/worker/base";
import { shouldSync } from "./issue.handler";

export type GithubCommentAction = "created" | "edited" | "deleted";

export type GithubCommentWebhookPayload = GithubWebhookPayload[
  | "webhook-issue-comment-created"
  | "webhook-issue-comment-edited"] & {
  isEnterprise: boolean;
};

export const handleIssueComment = async (store: Store, action: GithubCommentAction, data: unknown) => {
  // Check if this webhook was triggered by our own Plane->GitHub sync (loop prevention)
  // @ts-expect-error - Ignoring ts error for data type
  if (data && data.comment && data.comment.id) {
    // @ts-expect-error - Ignoring ts error for store get
    const exist = await store.get(`silo:comment:gh:${data.comment.id}`);
    if (exist) {
      logger.info(`[ISSUE-COMMENT] Event triggered by Plane->GitHub sync, skipping to prevent loop`);
      // Remove the key so future legitimate webhooks are not blocked
      // @ts-expect-error - Ignoring ts error for store del
      await store.del(`silo:comment:gh:${data.comment.id}`);
      return true;
    }
  }

  await syncCommentWithPlane(store, action, data as GithubCommentWebhookPayload);

  return true;
};

export const syncCommentWithPlane = async (
  store: Store,
  action: GithubCommentAction,
  data: GithubCommentWebhookPayload
) => {
  const ghIntegrationKey = data.isEnterprise ? E_INTEGRATION_KEYS.GITHUB_ENTERPRISE : E_INTEGRATION_KEYS.GITHUB;
  if (!data.installation || !shouldSync(data.issue.labels) || data.comment.user?.type !== "User") {
    logger.info(
      `${ghIntegrationKey}[COMMENT] No installation or should sync or comment user type is not user, skipping`,
      { repositoryId: data.repository.id, ghIntegrationKey }
    );
    return;
  }
  const { userCredentials, wsAdminCredentials } =
    await integrationConnectionHelper.getUserAndWSAdminCredentialsWithAdminFallback(
      ghIntegrationKey,
      data.installation.id.toString(),
      data.sender.id.toString()
    );

  if (!userCredentials || !wsAdminCredentials) {
    logger.info(`${ghIntegrationKey}[ISSUE-COMMENT] No plane credentials found, skipping`, {
      installationId: data.installation.id,
      repositoryId: data.repository.id,
    });
    return;
  }

  const { workspaceConnection, entityConnectionForRepository: entityConnection } =
    await getConnDetailsForGithubToPlaneSync({
      wsAdminCredentials: wsAdminCredentials as TWorkspaceCredential,
      type: EGithubEntityConnectionType.PROJECT_ISSUE_SYNC,
      repositoryId: data.repository.id.toString(),
      isEnterprise: data.isEnterprise,
    });

  if (!workspaceConnection.target_hostname) {
    throw new Error("Target hostname not found");
  }

  if (!entityConnection) {
    logger.info(`${ghIntegrationKey}[ISSUE-COMMENT] No entity connection found, skipping`, {
      repositoryId: data.repository.id,
      ghIntegrationKey,
    });
    return;
  }

  let planeClient: PlaneClient = await getPlaneAPIClient(wsAdminCredentials, ghIntegrationKey);

  const ghService = getGithubService(
    workspaceConnection as TGithubWorkspaceConnection,
    data.installation?.id.toString(),
    data.isEnterprise
  );
  const commentHtml = await ghService.getCommentHtml(
    data.repository.owner.login,
    data.repository.name,
    data.issue.number.toString(),
    data.comment.id
  );

  const issue = await getPlaneIssue(planeClient, entityConnection, data.issue.number.toString(), ghIntegrationKey);

  if (!issue) {
    logger.error(`${ghIntegrationKey}[ISSUE-COMMENT] Issue not found in Plane, skipping`, {
      workspace: workspaceConnection.workspace_slug,
      project: entityConnection.project_id ?? "",
      repositoryId: data.repository.id,
      ghIntegrationKey,
      issueId: data.issue.number.toString(),
    });
    return;
  }

  const userMap: Record<string, string> = Object.fromEntries(
    workspaceConnection.config.userMap.map((obj: any) => [obj.githubUser.login, obj.planeUser.id])
  );

  const planeUsers = await planeClient.users.list(
    workspaceConnection.workspace_slug,
    entityConnection.project_id ?? ""
  );

  let comment: ExIssueComment | null = null;

  try {
    comment = await planeClient.issueComment.getIssueCommentWithExternalId(
      workspaceConnection.workspace_slug,
      entityConnection.project_id ?? "",
      issue.id,
      data.comment.id.toString(),
      ghIntegrationKey
    );
  } catch (error) {}

  const planeComment = await transformGitHubComment(
    data.comment as unknown as WebhookGitHubComment,
    commentHtml ?? "<p></p>",
    encodeURI(env.SILO_API_BASE_URL + env.SILO_BASE_PATH + `/api/assets/${ghIntegrationKey.toLowerCase()}`),
    issue.id,
    data.repository.full_name,
    workspaceConnection.workspace_slug,
    entityConnection.project_id ?? "",
    planeClient,
    ghService,
    userMap,
    planeUsers,
    comment ? true : false
  );

  // if the user is a project member, set the planeClient to the userCredentials for comment to be created by the user token
  if (data.comment.user && data.comment.user.type === "User") {
    const githubComment = data.comment as unknown as WebhookGitHubComment;
    const isUserProjectMember = planeUsers.some((user) => user.id === userMap[githubComment?.user?.login ?? ""]);
    // if the user is a project member, set the planeClient to the userCredentials
    if (isUserProjectMember) {
      planeClient = await getPlaneAPIClient(userCredentials, ghIntegrationKey);
    }
  }

  if (comment) {
    await planeClient.issueComment.update(
      workspaceConnection.workspace_slug,
      entityConnection.project_id ?? "",
      issue.id,
      comment.id,
      planeComment
    );
    // Set key with Plane comment ID so Plane->GitHub handler can detect and skip
    // Use 5 second TTL to allow the webhook loop back but expire quickly
    await store.set(`silo:comment:plane:${comment.id}`, "true", 5);
  } else {
    const createdComment = await planeClient.issueComment.create(
      workspaceConnection.workspace_slug,
      entityConnection.project_id ?? "",
      issue.id,
      planeComment
    );
    // Set key with Plane comment ID so Plane->GitHub handler can detect and skip
    // Use 5 second TTL to allow the webhook loop back but expire quickly
    await store.set(`silo:comment:plane:${createdComment.id}`, "true", 5);
  }
};

const getPlaneIssue = async (
  planeClient: PlaneClient,
  entityConnection: TGithubEntityConnection,
  issueId: string,
  ghIntegrationKey: E_INTEGRATION_KEYS
) => {
  try {
    return await planeClient.issue.getIssueWithExternalId(
      entityConnection.workspace_slug,
      entityConnection.project_id ?? "",
      issueId.toString(),
      ghIntegrationKey
    );
  } catch {
    return null;
  }
};
