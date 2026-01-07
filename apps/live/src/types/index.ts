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

import type { fetchPayload, onLoadDocumentPayload, storePayload } from "@hocuspocus/server";

export type TConvertDocumentRequestBody = {
  description_html: string;
  variant: "rich" | "document";
};

export interface OnLoadDocumentPayloadWithContext extends onLoadDocumentPayload {
  context: HocusPocusServerContext;
}

export interface FetchPayloadWithContext extends fetchPayload {
  context: HocusPocusServerContext;
}

export interface StorePayloadWithContext extends storePayload {
  context: HocusPocusServerContext;
}

export type TDocumentTypes = "project_page" | "sync_agent" | "server_agent" | "workspace_page" | "teamspace_page";

// Additional Hocuspocus types that are not exported from the main package
export type HocusPocusServerContext = {
  projectId: string | null;
  cookie: string;
  documentType: TDocumentTypes;
  workspaceSlug: string | null;
  userId: string;
  agentId?: string;
  parentId: string | null;
  teamspaceId: string | null;
};
