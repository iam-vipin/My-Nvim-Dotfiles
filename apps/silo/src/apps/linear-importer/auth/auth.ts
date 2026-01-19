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

import { createLinearAuthService } from "@plane/etl/linear";
import { env } from "@/env";

export const linearAuth = createLinearAuthService(
  env.LINEAR_CLIENT_ID,
  env.LINEAR_CLIENT_SECRET,
  encodeURI(env.SILO_API_BASE_URL + env.SILO_BASE_PATH + "/api/linear/auth/callback")
);
