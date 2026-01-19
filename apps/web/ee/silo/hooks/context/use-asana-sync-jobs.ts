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

import { useContext } from "react";
import type { AsanaConfig } from "@plane/etl/asana";
// silo contexts
import type { TImporterCreateContext } from "@/plane-web/silo/contexts";
import { ImporterSyncJobContext } from "@/plane-web/silo/contexts";

export function useAsanaSyncJobs() {
  const context = useContext<TImporterCreateContext<AsanaConfig>>(ImporterSyncJobContext);

  if (!context) {
    throw new Error("useAsanaSyncJobs must be used within an ImporterSyncJobContextProvider");
  }

  return context;
}
