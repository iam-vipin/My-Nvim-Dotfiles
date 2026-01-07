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

import type { JiraProps } from "@/jira/types";
import JiraService from "./api.service";
import { JiraAuth } from "./auth.service";

export const createJiraAuth = (
  clientId: string = "",
  clientSecret: string = "",
  callbackURL: string,
  authorizeURL: string,
  tokenURL: string
): JiraAuth => {
  if (!clientId || !clientSecret) {
    console.error("[JIRA] Client ID and client secret are required");
  }
  return new JiraAuth({
    clientId,
    clientSecret,
    callbackURL,
    authorizeURL,
    tokenURL,
  });
};

export const createJiraService = (props: JiraProps): JiraService => new JiraService(props);
