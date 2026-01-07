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

import * as dotenv from "@dotenvx/dotenvx";
import { z } from "zod";

dotenv.config();

// Environment variable validation
const envSchema = z.object({
  APP_VERSION: z.string().default("1.0.0"),
  NODE_ENV: z.string().default("production"),
  HOSTNAME: z.string().optional(),
  PORT: z.string().default("3000"),
  API_BASE_URL: z.string().url("API_BASE_URL must be a valid URL"),
  // CORS configuration
  CORS_ALLOWED_ORIGINS: z.string().default(""),
  // Live running location
  LIVE_BASE_PATH: z.string().default("/live"),
  // Compression options
  COMPRESSION_LEVEL: z.string().default("6").transform(Number),
  COMPRESSION_THRESHOLD: z.string().default("5000").transform(Number),
  // secret
  LIVE_SERVER_SECRET_KEY: z.string(),
  // Redis configuration
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().default("6379").transform(Number),
  REDIS_URL: z.string().optional(),
  // Iframely configuration
  IFRAMELY_URL: z.string(),
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 4));
    process.exit(1);
  }
  return result.data;
};

export const env = validateEnv();
