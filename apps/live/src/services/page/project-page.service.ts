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
import { PageService } from "./extended.service";

interface ProjectPageServiceParams {
  workspaceSlug: string | null;
  projectId: string | null;
  cookie: string | null;
  [key: string]: unknown;
}

export class ProjectPageService extends PageService {
  protected basePath: string;

  constructor(params: ProjectPageServiceParams) {
    super();
    const { workspaceSlug, projectId } = params;
    if (!workspaceSlug || !projectId) throw new AppError("Missing required fields.");
    // validate cookie
    if (!params.cookie) throw new AppError("Cookie is required.");
    // set cookie
    this.setHeader("Cookie", params.cookie);
    // set base path
    this.basePath = `/api/workspaces/${workspaceSlug}/projects/${projectId}`;
  }
}
