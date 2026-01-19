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

import { logger } from "@plane/logger";
import type { ExIssueLabel, Client as PlaneClient } from "@plane/sdk";
import { processBatchPromises } from "@/helpers/methods";
import { protect } from "@/lib";

/* ----------------------------- Label Creation Utilities ----------------------------- */
export const createLabelsForIssues = async (
  jobId: string,
  labels: ExIssueLabel[],
  planeClient: PlaneClient,
  workspaceSlug: string,
  projectId: string
): Promise<ExIssueLabel[]> => {
  const createOrUpdateLabel = async (label: ExIssueLabel): Promise<ExIssueLabel | undefined> => {
    try {
      const createdLabel: ExIssueLabel | undefined = await protect(
        planeClient.label.create.bind(planeClient.label),
        workspaceSlug,
        projectId,
        label
      );
      if (createdLabel) {
        return createdLabel;
      }

      return undefined;
    } catch (error) {
      logger.error(`Error while creating the label: ${label.name}`, {
        jobId: jobId,
      });
      return undefined;
    }
  };

  const createdLabels = await processBatchPromises(labels, createOrUpdateLabel, 2);
  return createdLabels.filter((label) => label !== undefined);
};
