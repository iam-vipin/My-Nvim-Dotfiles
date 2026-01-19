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

import type { ExPage } from "@plane/sdk";

export const createPageLinkback = (page: ExPage, pageURL: string) => {
  const description = page?.description_stripped?.slice(0, 100);
  const blocks: any[] = [];

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `<${pageURL}|${page.name}>`,
    },
  });

  if (description) {
    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: description,
        },
      },
      {
        type: "divider",
      }
    );
  }

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
        url: pageURL,
        action_id: "view_in_plane",
      },
    ],
  });

  return { blocks };
};
