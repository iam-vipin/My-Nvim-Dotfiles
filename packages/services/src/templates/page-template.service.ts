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

// plane imports
import { API_BASE_URL } from "@plane/constants";
import type { TPageTemplate } from "@plane/types";
import { ETemplateType } from "@plane/types";
// local imports
import { ProjectLevelTemplateServiceBase } from "./project-level-base.service";
import { WorkspaceLevelTemplateServiceBase } from "./workspace-level-base.service";

/**
 * Service class for managing page templates
 * @extends {WorkspaceLevelTemplateServiceBase}
 */
class WorkspacePageTemplateService extends WorkspaceLevelTemplateServiceBase<TPageTemplate> {
  constructor(BASE_URL?: string) {
    super(ETemplateType.PAGE, BASE_URL || API_BASE_URL);
  }
}
export const workspacePageTemplateService = new WorkspacePageTemplateService();

/**
 * Service class for managing page templates
 * @extends {ProjectLevelTemplateServiceBase}
 */
class ProjectPageTemplateService extends ProjectLevelTemplateServiceBase<TPageTemplate> {
  constructor(BASE_URL?: string) {
    super(ETemplateType.PAGE, BASE_URL || API_BASE_URL);
  }
}
export const projectPageTemplateService = new ProjectPageTemplateService();
