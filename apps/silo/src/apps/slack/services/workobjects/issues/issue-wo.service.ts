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

/**
 * @overview
 * Service responsible for handling work objects, ideally
 * the responsibility of this service is to handle all the logic
 * that is responsible for getting the entity required to create
 * the work object, create it and return the view for pushing it
 * back to slack
 */

import type {
  IIssueDetailService,
  IIssueWorkObjectViewService,
  TWorkItemDetailsCtx,
  TWorkObjectContext,
} from "@/apps/slack/types/workobjects";
import { getConnectionDetails } from "@/apps/slack/helpers/connection-details";
import { E_INTEGRATION_KEYS } from "@plane/types";
import { getSlackToPlaneUserMapFromWC, getPlaneToSlackUserMapFromWC } from "@/apps/slack/helpers/user";
import { DetailsNotFoundException } from "@/apps/slack/helpers/errors";

/**
 * Orchestrates the creation of Slack Work Objects for Plane issues.
 *
 * This service coordinates between:
 * - IssueDetailService: Fetches issue data from Plane
 * - IssueWorkObjectViewService: Transforms issue data to Slack Work Object format
 *
 * @example
 * const service = new IssueWorkObjectService(
 *   { slackUserId: 'U123', slackTeamId: 'T123' },
 *   issueDetailService,
 *   viewService
 * );
 * const workObject = await service.getWorkObject({
 *   workspaceSlug: 'acme',
 *   projectId: 'proj-123',
 *   issueId: 'issue-456'
 * });
 */
export class IssueWorkObjectService {
  /**
   * @param config - Slack user and team identifiers for context resolution
   * @param issueDetailService - Service to fetch issue details from Plane
   * @param issueWorkObjectViewService - Service to transform issue data to Work Object view
   */
  constructor(
    private readonly config: { slackUserId: string; slackTeamId: string },
    private readonly issueDetailService: IIssueDetailService,
    private readonly issueWorkObjectViewService: IIssueWorkObjectViewService
  ) {}

  /**
   * Retrieves issue details and generates a Slack Work Object view.
   *
   * Flow:
   * 1. Resolves Plane client and workspace connection context
   * 2. Fetches issue details via IssueDetailService
   * 3. Transforms issue data to Work Object format via IssueWorkObjectViewService
   *
   * @param props - Issue identifiers and optional unfurl URL
   * @returns Work Object view ready for Slack API consumption
   * @throws {DetailsNotFoundException} When workspace connection cannot be found
   */
  async getWorkObject(props: TWorkItemDetailsCtx & { appUnfurlUrl?: string }) {
    const {
      planeClient,
      planeCtx: { workspaceSlug },
    } = await this.createContext();
    const issueDetails = await this.issueDetailService.getWorkItemDetails(planeClient, {
      workspaceSlug,
      ...props,
    });
    const view = this.issueWorkObjectViewService.getWorkItemView(workspaceSlug, issueDetails, {
      appUnfurlUrl: props.appUnfurlUrl,
    });

    return view;
  }

  /**
   * Resolves Slack-Plane integration context including authenticated Plane client.
   *
   * Retrieves workspace connection details using Slack team/user IDs and constructs
   * context with Plane client, workspace info, and user mappings.
   *
   * @returns Context containing Plane client, workspace info, and user mappings
   * @throws {DetailsNotFoundException} When connection details are not found
   * @private
   */
  private async createContext(): Promise<TWorkObjectContext> {
    const { slackUserId, slackTeamId } = this.config;

    const details = await getConnectionDetails(slackTeamId, {
      id: slackUserId,
    });
    if (!details) {
      throw new DetailsNotFoundException(E_INTEGRATION_KEYS.SLACK, {
        teamId: slackTeamId,
        userId: slackUserId,
      });
    }

    const { workspaceConnection, planeClient } = details;

    return {
      planeCtx: {
        workspaceId: workspaceConnection.workspace_id,
        workspaceSlug: workspaceConnection.workspace_slug,
      },
      planeClient,
      userMap: {
        planeToSlack: getPlaneToSlackUserMapFromWC(workspaceConnection),
        slackToPlane: getSlackToPlaneUserMapFromWC(workspaceConnection),
      },
    };
  }
}
