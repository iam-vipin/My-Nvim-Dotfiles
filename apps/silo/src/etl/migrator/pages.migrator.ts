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

import { v4 as uuidv4 } from "uuid";
import type { PlanePageEntity } from "@plane/etl/core";
import type { TImportJob } from "@plane/types";
import { celeryProducer } from "@/worker";
import { getCredentialsForMigration } from "./helpers";

export class PagesMigrator {
  static async migrate(job: TImportJob, data: PlanePageEntity): Promise<void> {
    const credentials = await getCredentialsForMigration(job);
    const { pages } = data;

    await celeryProducer.registerTask(
      {
        pages,
      },
      job.workspace_slug,
      job.project_id,
      job.id,
      credentials.user_id,
      uuidv4(),
      "plane.bgtasks.data_import_task.import_data"
    );
    return;
  }
}
