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

import type { Client, ExIssue as PlaneIssue, ExIssueComment, ExIssueLabel, PlaneUser } from "@plane/sdk";
import type { TIssueStateMap } from "@plane/types";
import type { GitlabContentParserConfig } from "./content-parser";
import type { GitlabIssue, GitLabService, GitlabNote } from "@plane/etl/gitlab";

import { transformPlaneLabel } from "@plane/etl/gitlab";
import { E_INTEGRATION_KEYS, E_ISSUE_STATE_MAP_KEYS } from "@plane/types";
import { getGitlabContentParser } from "./content-parser";
import { GITLAB_ISSUE_EXTERNAL_ID } from "./cache-keys";
import { parse } from "node-html-parser";

export const replaceIssueNumber = (html: string, repo: string, gitlabBaseUrl: string) => {
  const pattern = /#(\d+)/g;
  return html.replace(pattern, (_match, issueNumber) => {
    return `<a href=${gitlabBaseUrl}/${repo}/issues/${issueNumber}>${repo} #${issueNumber}</a>`;
  });
};

export const transformGitlabIssue = async (
  issue: GitlabIssue,
  planeClient: Client,
  repository: string,
  issueStateMap: TIssueStateMap | undefined,
  workspaceSlug: string,
  projectId: string,
  gitlabService: GitLabService,
  accessToken: string,
  apiBaseUrl: string,
  gitlabUploadsPrefix: string,
  gitlabBaseUrl: string = "https://gitlab.com",
  isEnterprise: boolean = false
): Promise<Partial<PlaneIssue>> => {
  const glIntegrationKey = isEnterprise ? E_INTEGRATION_KEYS.GITLAB_ENTERPRISE : E_INTEGRATION_KEYS.GITLAB;
  const links = [
    {
      name: "Linked GitLab Issue",
      url: issue.web_url,
    },
  ];

  let creator: string | undefined;

  let issueDescription = issue.description || "";

  const config: GitlabContentParserConfig = {
    planeClient,
    workspaceSlug,
    projectId,
    userMap: new Map(),
    gitlabService,
    fileDownloadHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    apiBaseUrl: apiBaseUrl,
  };

  const contentParser = getGitlabContentParser(config, isEnterprise, apiBaseUrl);
  issueDescription = addUploadsPrefixToGitlabMarkdown(issueDescription, gitlabUploadsPrefix);
  let issueDescriptionHtml = await contentParser.toPlaneHtml(issueDescription);
  // Replace the issue number with the actual issue number in gitlab
  issueDescriptionHtml = replaceIssueNumber(issueDescriptionHtml, repository, gitlabBaseUrl);

  let labels = issue.labels || [];
  labels = labels.filter((label) => label.toLowerCase() !== "plane");

  let targetState: string | undefined = undefined;
  if (issue.state) {
    const states = (await planeClient.state.list(workspaceSlug, projectId)).results;
    const backlogState = states.find((state) => state.group === "backlog");
    const doneState = states.find((state) => state.group === "completed");
    if (issue.state === "opened") {
      targetState = backlogState?.id;
    } else if (issue.state === "closed") {
      targetState = doneState?.id;
    }
  }

  // if they have configured the issue state map, use it to set the target state
  if (issueStateMap && Object.keys(issueStateMap).length > 0) {
    if (issue.state === "opened") {
      targetState = issueStateMap[E_ISSUE_STATE_MAP_KEYS.ISSUE_OPEN]?.id;
    } else if (issue.state === "closed") {
      targetState = issueStateMap[E_ISSUE_STATE_MAP_KEYS.ISSUE_CLOSED]?.id;
    }
  }

  return {
    external_id: GITLAB_ISSUE_EXTERNAL_ID(issue.project_id.toString(), issue.iid.toString()),
    external_source: glIntegrationKey,
    created_by: creator,
    name: issue.title,
    description_html: issueDescriptionHtml,
    created_at: issue.created_at,
    state: targetState,
    labels: labels,
    links,
  };
};

export const transformGitlabComment = async (
  comment: GitlabNote,
  repository: string,
  workspaceSlug: string,
  projectId: string,
  issueId: string,
  planeLinkedCommentId: string,
  planeClient: Client,
  gitlabService: GitLabService,
  accessToken: string,
  apiBaseUrl: string,
  gitlabUploadsPrefix: string,
  gitlabBaseUrl: string = "https://gitlab.com",
  isEnterprise: boolean = false,
  isUpdate: boolean = false
): Promise<Partial<ExIssueComment>> => {
  const glIntegrationKey = isEnterprise ? E_INTEGRATION_KEYS.GITLAB_ENTERPRISE : E_INTEGRATION_KEYS.GITLAB;

  let commentBody = (comment.body || "").trim();
  const config: GitlabContentParserConfig = {
    planeClient,
    workspaceSlug,
    projectId,
    gitlabService,
    fileDownloadHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    apiBaseUrl: apiBaseUrl,
    userMap: new Map(),
  };
  const contentParser = getGitlabContentParser(config, isEnterprise, apiBaseUrl);
  commentBody = addUploadsPrefixToGitlabMarkdown(commentBody, gitlabUploadsPrefix);
  let commentHtml = await contentParser.toPlaneHtml(commentBody);
  commentHtml = replaceIssueNumber(commentHtml, repository, gitlabBaseUrl);

  // append the user info to the comment
  if (!isUpdate) {
    commentHtml = `${commentHtml} \n\n <p>Comment by ${comment.author.name} on Gitlab</p>`;
  }
  return {
    external_id: comment.id.toString(),
    external_source: glIntegrationKey,
    created_at: comment.created_at,
    created_by: undefined,
    comment_html: commentHtml,
    actor: undefined,
    issue: issueId,
    parent: planeLinkedCommentId,
  };
};

export const transformPlaneIssue = async (
  issue: PlaneIssue,
  imgSrcPrefix: string,
  labels: ExIssueLabel[],
  gitlabService: GitLabService,
  accessToken: string,
  issueStateMap: TIssueStateMap | undefined,
  planeClient: Client,
  workspaceSlug: string,
  projectId: string,
  apiBaseUrl: string,
  isEnterprise: boolean = false
): Promise<Partial<GitlabIssue>> => {
  // If there is a gitlab label, remove it and add a plane label
  const issueLabels: ExIssueLabel[] = [];
  const allIssueLabelIds = (issue.labels || []).map((label) => (label as unknown as ExIssueLabel).id);
  labels.forEach((label) => {
    if (allIssueLabelIds.includes(label.id) && label.name.toLowerCase() !== "gitlab") {
      issueLabels.push(label);
    }
  });

  const glLabels = issueLabels?.map((label) => transformPlaneLabel(label)) || [];
  glLabels.push({
    name: "plane",
    color: "438bde",
  });

  // Convert the cleaned HTML to Gitlab markdown using our ContentParser
  const config: GitlabContentParserConfig = {
    planeClient,
    gitlabService,
    workspaceSlug,
    projectId,
    userMap: new Map(),
    fileDownloadHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    apiBaseUrl: apiBaseUrl,
  };
  const contentParser = getGitlabContentParser(config, isEnterprise, apiBaseUrl);
  const planeUsers = await planeClient.users.list(workspaceSlug, projectId);
  const descriptionHtml = replacePlaneUserMentions(issue.description_html, planeUsers);
  const glIssueBody = contentParser.toMarkdown(descriptionHtml, imgSrcPrefix);

  // set the target state based on the issue state
  let targetState: "reopen" | "close" | undefined = undefined;
  if (issue.state) {
    const states = (await planeClient.state.list(workspaceSlug, projectId)).results;
    const issueState = states.find((state) => state.id === issue.state);
    if (issueState?.group === "completed") {
      targetState = "close";
    } else {
      targetState = "reopen";
    }
  }

  // if they have configured the issue state map, use it to set the target state
  if (issueStateMap && Object.keys(issueStateMap).length > 0) {
    const planeStateForIssueClosed = issueStateMap[E_ISSUE_STATE_MAP_KEYS.ISSUE_CLOSED]?.id;
    const planeStateForIssueOpen = issueStateMap[E_ISSUE_STATE_MAP_KEYS.ISSUE_OPEN]?.id;
    // if customer mark the issue as a state that they have configured as closed, set the target state to closed
    // if customer mark the issue as a state that they have configured as open, set the target state to open
    if (planeStateForIssueClosed && issue.state === planeStateForIssueClosed) {
      targetState = "close";
    } else if (planeStateForIssueOpen && issue.state === planeStateForIssueOpen) {
      targetState = "reopen";
    }
  }

  return {
    title: issue.name,
    description: glIssueBody,
    state_event: targetState,
    created_at: issue.created_at,
    labels: glLabels.map((label) => label.name ?? ""),
  };
};

const replacePlaneUserMentions = (html: string, planeUsers: PlaneUser[]) => {
  // get all the entity_identifier from the html
  // and replace the mention tag with span tag with the user display name and the text "Plane User"
  const mentionComponents = parse(html).querySelectorAll("mention-component");
  if (!mentionComponents) return html;

  mentionComponents.forEach((component) => {
    const userId = component.getAttribute("entity_identifier");
    const user = planeUsers.find((user) => user.id === userId);
    if (user) {
      html = html.replace(component.outerHTML, `<span>${user.display_name}(Plane User)</span>`);
    }
  });
  return html;
};

const addUploadsPrefixToGitlabMarkdown = (markdown: string, uploadsPrefix: string) => {
  // replace the image url with the uploads prefix
  // keep the original image name
  return markdown.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)(\{[^}]*\})?/g, `![$1](${uploadsPrefix}$2)`);
};
