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

/**
 * Centralized key management for Notion importer
 * This ensures consistent key formatting and naming across the application
 */

import type { ENotionImporterKeyType } from "../types";

// Key prefixes
const KEY_PREFIX = "SILO_NOTION_IMPORTER";

/**
 * Creates consistent cache keys for Notion importer
 * @param type The type of key from KeyType enum
 * @param id Primary identifier (usually fileId)
 * @param subId Optional secondary identifier (like pageId, assetId, etc.)
 */
export const getKey = (jobId: string, fileId: string, type: ENotionImporterKeyType): string =>
  `${KEY_PREFIX}_${jobId}_${type}_${fileId}`;
