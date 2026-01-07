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

import type { Issue, IssueLabel, User } from "@linear/sdk";
import type { LinearService } from "@/linear/services";
import type { LinearComment, LinearCycle, LinearIssueAttachment, LinearProject } from "@/linear/types";

export async function pullUsers(client: LinearService, teamId: string): Promise<User[]> {
  const members = await client.getTeamMembers(teamId);
  return members.nodes;
}

export async function pullLabels(client: LinearService): Promise<IssueLabel[]> {
  const labels = await client.getIssueLabels();
  return labels.nodes;
}

export async function pullIssues(client: LinearService, teamId: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  let cursor: string | undefined;

  do {
    const response = await client.getTeamIssues(teamId, cursor);
    issues.push(...response.nodes);
    cursor = response.pageInfo.endCursor;
  } while (cursor);

  return issues;
}

export async function pullAttachments(
  issues: Issue[],
  client: LinearService
): Promise<Record<string, LinearIssueAttachment[]>> {
  const attachments: Record<string, LinearIssueAttachment[]> = {};
  for (const issue of issues) {
    const attachments = await client.getIssuesAttachments(issue);
    attachments[issue.id] = attachments;
  }
  return attachments;
}

export async function pullComments(issues: Issue[], client: LinearService): Promise<LinearComment[]> {
  const issueIds = issues.map((issue) => issue.id);
  const comments = await client.getIssuesComments(issueIds);
  return comments;
}

export async function pullCycles(client: LinearService, teamId: string): Promise<LinearCycle[]> {
  const cycles: LinearCycle[] = [];
  try {
    const teamCycles = await client.getTeamCycles(teamId);
    for (const cycle of teamCycles.nodes) {
      const cycleIssues = await client.getCycleIssues(cycle.id, teamId);
      cycles.push({ cycle, issues: cycleIssues });
    }
  } catch (e) {
    throw Error(`Could not fetch cycles, something went wrong`);
  }
  return cycles;
}

export async function pullProjects(client: LinearService, teamId: string): Promise<LinearProject[]> {
  const projects: LinearProject[] = [];
  try {
    const teamProjects = await client.getTeamProjects(teamId);
    for (const project of teamProjects.nodes) {
      const projectIssues = await client.getProjectIssues(project.id);
      projects.push({ project, issues: projectIssues.nodes });
    }
  } catch (e) {
    console.log(e);
    throw Error(`Could not fetch projects, something went wrong`);
  }
  return projects;
}

export async function pullDocuments(client: LinearService, teamId: string): Promise<any[]> {
  const documents: any[] = [];
  try {
    const teamDocuments = await client.getDocuments(teamId);
    documents.push(...teamDocuments);
  } catch (e) {
    throw Error(`Could not fetch documents, something went wrong`);
  }
  return documents;
}

// export const pullCommentsForIssue = async (
//   issue: Issue,
//   client: LinearService,
// ): Promise<LinearComment[]> => {
//   const comments: LinearComment[] = [];
//   let cursor: string | undefined;
//
//   do {
//     const response = await client.getIssuesComments(issues);
//     const linearComment = response.nodes.map((comment): LinearComment => {
//       return {
//         ...comment,
//         issue_id: issue.id,
//       } as unknown as LinearComment;
//     });
//     comments.push(...linearComment);
//     cursor = response.pageInfo.endCursor;
//   } while (cursor);
//
//   return comments;
// };
//
// export const pullCommentsInBatches = async (
//   issues: Issue[],
//   batchSize: number,
//   client: LinearService,
// ): Promise<LinearComment[]> => {
//   const comments: LinearComment[] = [];
//   for (let i = 0; i < issues.length; i += batchSize) {
//     const batch = issues.slice(i, i + batchSize);
//     const batchComments = await Promise.all(
//       batch.map((issue) => pullCommentsForIssue(issue, client)),
//     );
//     comments.push(...batchComments.flat());
//   }
//   return comments;
// };
