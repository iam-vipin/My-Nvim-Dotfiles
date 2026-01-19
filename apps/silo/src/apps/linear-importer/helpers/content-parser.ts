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

import { E_IMPORTER_KEYS } from "@plane/etl/core";
import type { LinearService } from "@plane/etl/linear";
import type { Client } from "@plane/sdk";
import {
  ContentParser,
  ExternalImageParserExtension,
  ExternalMentionParserExtension,
  ExternalFileParserExtension,
} from "@/lib/parser";
import { LinearIssueMentionParserExtension, LinearProjectMentionParserExtension } from "./extensions";
import { LinearSectionParserExtension } from "./extensions/sections";

export type LinearContentParserConfig = {
  planeClient: Client;
  linearService: LinearService;
  workspaceSlug: string;
  projectId: string;
  fileDownloadHeaders: Record<string, string>;
  apiBaseUrl: string;
  appBaseUrl?: string;
  userMap: Map<string, string>;
};

export const getContentParser = (config: LinearContentParserConfig) => {
  const fileHelperConfig = {
    planeClient: config.planeClient,
    workspaceSlug: config.workspaceSlug,
    projectId: config.projectId,
    externalSource: E_IMPORTER_KEYS.LINEAR,
    fileDownloadHeaders: config.fileDownloadHeaders,
  };

  const imageParserExtension = new ExternalImageParserExtension({
    ...fileHelperConfig,
  });
  const fileParserExtension = new ExternalFileParserExtension({
    ...fileHelperConfig,
    apiBaseUrl: config.apiBaseUrl,
    downloadableUrlPrefix: "https://uploads.linear.app",
  });
  const userMentionParserExtension = new ExternalMentionParserExtension({
    entityMap: config.userMap,
  });

  const issueMentionParserExtension = new LinearIssueMentionParserExtension({
    workspaceSlug: config.workspaceSlug,
    projectId: config.projectId,
    planeClient: config.planeClient,
    linearService: config.linearService,
  });

  const projectMentionParserExtension = new LinearProjectMentionParserExtension({
    workspaceSlug: config.workspaceSlug,
    projectId: config.projectId,
    planeClient: config.planeClient,
    linearService: config.linearService,
    APP_BASE_URL: config.appBaseUrl ?? config.apiBaseUrl,
  });

  const sectionParserExtension = new LinearSectionParserExtension();

  return new ContentParser(
    [
      imageParserExtension,
      fileParserExtension,
      userMentionParserExtension,
      projectMentionParserExtension,
      issueMentionParserExtension,
    ],
    [sectionParserExtension]
  );
};
