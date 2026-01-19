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

// helpers
import type { IWebhook, IWorkspace } from "@plane/types";
import { renderFormattedPayloadDate } from "@plane/utils";
// types

export const getCurrentHookAsCSV = (
  currentWorkspace: IWorkspace | null,
  webhook: IWebhook | undefined,
  secretKey: string | undefined
) => ({
  id: webhook?.id || "",
  url: webhook?.url || "",
  created_at: renderFormattedPayloadDate(webhook?.created_at || "") ?? "",
  updated_at: renderFormattedPayloadDate(webhook?.updated_at || "") ?? "",
  is_active: webhook?.is_active?.toString() || "",
  secret_key: secretKey || "",
  project: webhook?.project?.toString() || "",
  issue: webhook?.issue?.toString() || "",
  module: webhook?.module?.toString() || "",
  cycle: webhook?.cycle?.toString() || "",
  issue_comment: webhook?.issue_comment?.toString() || "",
  workspace: currentWorkspace?.name || "",
});
