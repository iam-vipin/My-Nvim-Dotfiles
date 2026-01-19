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
import DB from "@/db/client";
import { decryptAES } from "@/helpers/decrypt";
import type { TApplicationSecret } from "@/types/dbquery";

// get the db instance
const db = DB.getInstance();

/**
 * Get all users
 * @returns {Promise<any[]>}
 * @example
 */
export const healthCheck = async () => {
  try {
    await db.query("SELECT 1");
    return true;
  } catch (error) {
    logger.error("Error checking db health", { error });
    return false;
  }
};

/**
 * Get application secret
 * @param key - key of the application secret
 * @returns {Promise<TApplicationSecret>}
 */
export const getAppSecret = async (key: string) => {
  const app = await db.query<TApplicationSecret>(
    `SELECT * FROM application_secrets WHERE key = $1 and deleted_at is null`,
    [key]
  );
  return app[0];
};

/**
 * Get application secret value
 * @param key - key of the application secret
 * @returns {Promise<string>}
 */
export const getAppSecretValue = async (key: string) => {
  const app = await getAppSecret(key);
  if (!app || !app.value) {
    throw new Error(`Application secret value not found for key: ${key}`);
  }

  const encryptedSecret = {
    iv: app.value.split(":")[0],
    ciphertext: app.value.split(":")[1],
    tag: app.value.split(":")[2],
  };
  if (app.is_secured) {
    return decryptAES(encryptedSecret);
  }
  return app.value;
};
