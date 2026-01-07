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

import { ETemplateType } from "@plane/types";
// plane imports

export type TCopyTemplateResponse = {
  template_id: string;
};

/**
 * Maps template types to their corresponding API path segments
 */
const TEMPLATE_PATH_MAPPING: Record<ETemplateType, string> = {
  [ETemplateType.WORK_ITEM]: "/workitems",
  [ETemplateType.PAGE]: "/pages",
  [ETemplateType.PROJECT]: "/projects",
};

/**
 * Returns the URL path segment for a given template type
 * @param templateType - The type of template
 * @returns The corresponding URL path segment
 */
export const getTemplatePathSegment = (templateType: ETemplateType): string =>
  TEMPLATE_PATH_MAPPING[templateType] || "";

/**
 * Constructs the complete API URL for template operations
 * @param workspaceSlug - The workspace identifier
 * @param templateType - The type of template
 * @param templateId - Optional template identifier to append to the URL
 * @returns Fully formed template API URL
 */
export const buildWorkspaceLevelTemplateApiUrl = (
  workspaceSlug: string,
  templateType: ETemplateType,
  templateId?: string
): string => {
  const pathSegment = getTemplatePathSegment(templateType);
  const baseUrl = `/api/workspaces/${workspaceSlug}${pathSegment}/templates/`;

  return templateId ? `${baseUrl}${templateId}/` : baseUrl;
};

/**
 * Constructs the complete API URL for project level template operations
 * @param workspaceSlug - The workspace identifier
 * @param projectId - The project identifier
 * @param templateType - The type of template
 * @param templateId - Optional template identifier to append to the URL
 * @returns Fully formed project level template API URL
 */
export const buildProjectLevelTemplateApiUrl = (
  workspaceSlug: string,
  projectId: string,
  templateType: ETemplateType,
  templateId?: string
): string => {
  const pathSegment = getTemplatePathSegment(templateType);
  const baseUrl = `/api/workspaces/${workspaceSlug}/projects/${projectId}${pathSegment}/templates/`;

  return templateId ? `${baseUrl}${templateId}/` : baseUrl;
};
