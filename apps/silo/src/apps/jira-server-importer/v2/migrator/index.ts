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

import type { MQ, Store } from "@/worker/base";
import { JiraImportOrchestrator } from "./orchestrator";
import JIRA_CLOUD_STEPS from "./steps/cloud";
import JIRA_SERVER_STEPS from "./steps/server";

export const getJiraCloudImportOrchestrator = (mq: MQ, store: Store) =>
  new JiraImportOrchestrator(mq, store, JIRA_CLOUD_STEPS);

export const getJiraServerImportOrchestrator = (mq: MQ, store: Store) =>
  new JiraImportOrchestrator(mq, store, JIRA_SERVER_STEPS);
