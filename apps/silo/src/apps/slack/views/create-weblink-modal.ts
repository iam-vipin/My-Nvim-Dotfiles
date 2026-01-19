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

import { ENTITIES } from "../helpers/constants";
import type { MetadataPayloadShort } from "../types/types";
import { E_MESSAGE_ACTION_TYPES } from "../types/types";

export const createWebLinkModal = (payload: MetadataPayloadShort) => ({
  type: "modal",
  callback_id: E_MESSAGE_ACTION_TYPES.ISSUE_WEBLINK_SUBMISSION,
  private_metadata: JSON.stringify({ entityType: ENTITIES.ISSUE_WEBLINK_SUBMISSION, entityPayload: payload }),
  title: {
    type: "plain_text",
    text: "Create Web Link",
    emoji: true,
  },
  submit: {
    type: "plain_text",
    text: "Submit",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true,
  },
  blocks: [
    {
      type: "input",
      element: {
        type: "plain_text_input",
        placeholder: {
          type: "plain_text",
          text: "Enter link label",
        },
      },
      label: {
        type: "plain_text",
        text: "Display Title",
        emoji: true,
      },
    },
    {
      type: "input",
      element: {
        type: "url_text_input",
        placeholder: {
          type: "plain_text",
          text: "Enter URL",
        },
      },
      label: {
        type: "plain_text",
        text: "Web URL 🔗",
        emoji: true,
      },
    },
  ],
});
