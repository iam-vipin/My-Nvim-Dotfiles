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

import type { ExProject, PlaneUser } from "@plane/sdk";
import { getPlaneLogoUrl, getProjectUrl } from "@/helpers/urls";
import { invertStringMap } from "@/helpers/utils";
import { ACTIONS } from "../helpers/constants";
import { getUserMarkdown } from "../helpers/user";

export const createProjectLinkback = (
  workspaceSlug: string,
  project: ExProject,
  members: PlaneUser[],
  userMap: Map<string, string>,
  showLogo = false
) => {
  const blocks: any[] = [];

  const planeToSlackUserMap = invertStringMap(userMap);

  let sectionContent = `Project: *${project.name}*`;

  // Members (max 2 with + icon if more)
  if (project.total_members && project.total_members > 0) {
    if (members.length > 0) {
      const memberText = members
        .slice(0, 2)
        .map((member) => getUserMarkdown(planeToSlackUserMap, workspaceSlug, member.id, member.display_name))
        .join(", ");
      const plusText = project.total_members > 2 ? ` and ${project.total_members - 2} more` : "";
      sectionContent += `\nMembers: *${memberText}${plusText}*`;
    }
  }

  // Lead (as mention if exists)
  if (project.project_lead) {
    const lead = members.find((member) => member.id === project.project_lead);
    if (lead) {
      sectionContent += `\nLead: *${getUserMarkdown(planeToSlackUserMap, workspaceSlug, lead.id, lead.display_name)}*`;
    }
  }

  // Main section with project details
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: sectionContent,
    },
  });

  // Divider
  blocks.push({
    type: "divider",
  });

  // Action buttons
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "View in Plane",
          emoji: true,
        },
        url: getProjectUrl(workspaceSlug, project.identifier ?? ""),
        action_id: "view_project_in_plane",
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Create Work Item",
          emoji: true,
        },
        value: `${project.id}`,
        action_id: ACTIONS.CREATE_WORK_ITEM,
      },
    ],
  });

  if (showLogo) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "image",
          image_url: getPlaneLogoUrl(),
          alt_text: "Plane",
        },
        {
          type: "mrkdwn",
          text: `*Plane*`,
        },
      ],
    });
  }

  return { blocks };
};
