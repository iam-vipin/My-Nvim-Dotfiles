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

import { GITLAB_LABEL } from "@/helpers/constants";

const SYNC_LABEL = "plane";

export const shouldSyncGitlabToPlane = (labels: string[]): boolean =>
  labels.some((label) => label.toLowerCase() === SYNC_LABEL);

export const shouldSyncPlaneToGitlab = (labels: { name: string }[]): boolean =>
  labels.some((label) => label.name.toLowerCase() === GITLAB_LABEL);
