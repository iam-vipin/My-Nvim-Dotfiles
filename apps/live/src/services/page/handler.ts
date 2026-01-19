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

import { AppError } from "@/lib/errors";
import type { HocusPocusServerContext, TDocumentTypes } from "@/types";
// services
import { ProjectPageService } from "./project-page.service";
import { ServerAgentPageService } from "./server-agent.service";
import { SyncAgentPageService } from "./sync-agent.service";
import { TeamspacePageService } from "./teamspace-page.service";
import { WorkspacePageService } from "./workspace-page.service";

export const getPageService = (documentType: TDocumentTypes, context: HocusPocusServerContext) => {
  if (documentType === "sync_agent") {
    return new SyncAgentPageService();
  }

  if (documentType === "server_agent") {
    return new ServerAgentPageService();
  }

  if (documentType === "project_page") {
    return new ProjectPageService({
      workspaceSlug: context.workspaceSlug,
      projectId: context.projectId,
      cookie: context.cookie,
    });
  }

  if (documentType === "teamspace_page") {
    return new TeamspacePageService({
      workspaceSlug: context.workspaceSlug,
      teamspaceId: context.teamspaceId,
      cookie: context.cookie,
    });
  }

  if (documentType === "workspace_page") {
    return new WorkspacePageService({
      workspaceSlug: context.workspaceSlug,
      cookie: context.cookie,
    });
  }

  throw new AppError(`Invalid document type ${documentType} provided.`);
};
