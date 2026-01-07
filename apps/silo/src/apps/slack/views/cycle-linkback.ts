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

import type { ExCycle, ExProject } from "@plane/sdk";
import { env } from "@/env";
import { getPlaneLogoUrl } from "@/helpers/urls";
import { ACTIONS } from "../helpers/constants";
import { formatTimestampToNaturalLanguage } from "../helpers/format-date";

export const createCycleLinkback = (workspaceSlug: string, project: ExProject, cycle: ExCycle, showLogo = false) => {
  const blocks: any[] = [];

  // Build markdown content for main section
  let sectionContent = `Cycle: *${cycle.name}*`;

  // Project
  sectionContent += `\nProject: *${project.name}*`;

  // Status and dates
  const today = new Date();
  const startDate = cycle.start_date ? new Date(cycle.start_date) : null;
  const endDate = cycle.end_date ? new Date(cycle.end_date) : null;

  let status = "Not started";
  if (startDate && endDate) {
    if (today > endDate) {
      status = "Completed";
    } else if (today >= startDate && today <= endDate) {
      status = "Active";
    } else if (today < startDate) {
      status = "Upcoming";
    }
  }

  sectionContent += `\nStatus: *${status}*`;

  // Dates
  if (cycle.start_date && cycle.end_date) {
    sectionContent += `\nDuration: *${formatTimestampToNaturalLanguage(cycle.start_date, false)} - ${formatTimestampToNaturalLanguage(cycle.end_date, false)}*`;
  }

  // Progress
  if (typeof cycle.completed_issues === "number" && typeof cycle.total_issues === "number") {
    const progress = cycle.total_issues > 0 ? Math.round((cycle.completed_issues / cycle.total_issues) * 100) : 0;
    sectionContent += `\nProgress: *${progress}% (${cycle.completed_issues}/${cycle.total_issues} issues)*`;
  }

  // Main section with cycle details
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
        url: `${env.APP_BASE_URL}/${workspaceSlug}/projects/${project.id}/cycles/${cycle.id}`,
        action_id: "view_cycle_in_plane",
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

  // Add Plane Logo with Title on top
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

  return { blocks };
};
