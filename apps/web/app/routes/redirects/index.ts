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

import type { RouteConfigEntry } from "@react-router/dev/routes";
import { coreRedirectRoutes } from "./core";
import { extendedRedirectRoutes } from "./extended";

/**
 * REDIRECT ROUTES
 * Centralized configuration for all route redirects
 * Migrated from Next.js next.config.js redirects
 */
export const redirectRoutes: RouteConfigEntry[] = [...coreRedirectRoutes, ...extendedRedirectRoutes];
