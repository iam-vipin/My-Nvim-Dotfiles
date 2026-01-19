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

import type { TProjectBaseActivity } from "@plane/types";

export type TProjectActivity = TProjectBaseActivity & {
  content: string;
  userId: string;
  projectId: string;

  actor_detail: {
    display_name: string;
    id: string;
  };
  workspace_detail: {
    slug: string;
  };
  project_detail: {
    name: string;
  };

  createdAt: string;
  updatedAt: string;
};
