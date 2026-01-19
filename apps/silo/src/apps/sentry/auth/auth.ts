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

import type { SentryAuthService } from "@plane/etl/sentry";
import { createSentryAuth } from "@plane/etl/sentry";
import { env } from "@/env";

export const sentryAuth = createSentryAuth({
  clientId: env.SENTRY_CLIENT_ID,
  clientSecret: env.SENTRY_CLIENT_SECRET,
  integrationSlug: env.SENTRY_INTEGRATION_SLUG,
  baseUrl: env.SENTRY_BASE_URL,
}) as SentryAuthService;
