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

import pg from "pg";
import { logger } from "@plane/logger";
import { env } from "@/env";

// PostgreSQL error codes that indicate SSL/connection configuration issues
// These errors can often be resolved by retrying with sslmode=no-verify
const SSL_RELATED_ERROR_CODES = [
  "28000", // Authentication failure (SSL cert verification)
  "08006", // Connection failure (no pg_hba.conf entry, SSL mismatch)
  "08001", // Client unable to establish connection (SSL/network issues)
  "08004", // Server rejected connection (SSL policy conflicts)
  "08P01", // Protocol violation (SSL version/cipher mismatch)
] as const;

/**
 * Database class
 * @description This class is used to connect to the database and execute queries
 * @example
 * const db = DB.getInstance();
 * const users = await db.query("SELECT * FROM users");
 * or write a query in query.ts and then use it
 */
class DB {
  private static instance: DB;
  private pool?: pg.Pool;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  public async init(): Promise<void> {
    if (!this.pool) {
      await this.connect();
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnected) return;
    let dbURI = env.DATABASE_URL;
    if (!dbURI) {
      logger.warn("Database URL is not set.. skipping database connection");
      return;
    }
    const maxAttempts = parseInt(env.MAX_DB_CONNECTION_ATTEMPTS) || 3;
    const retryDelay = 1000;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        this.pool = new pg.Pool({
          connectionString: dbURI,
          application_name: "silo",
        });
        // Test the connection
        await this.pool.query("SELECT 1");
        this.isConnected = true;
        logger.info("✅----Successfully connected to database----");
        break;
      } catch (error) {
        logger.error("❌----Error connecting to database----", { error });
        // Handle SSL-related connection errors only
        if (
          error instanceof Error &&
          "code" in error &&
          SSL_RELATED_ERROR_CODES.includes(error.code as any) &&
          !dbURI.includes("sslmode=no-verify")
        ) {
          logger.info("🔄----Retrying connection with SSL Mode no verify----");
          dbURI = dbURI?.concat("?sslmode=no-verify");
        }
        if (i < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          throw error;
        }
      }
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) {
      await this.connect();
    }
    try {
      logger.info(`Executing query: ${sql}`, { params });
      const result = await this.pool!.query(sql, params);
      return result.rows;
    } catch (error) {
      logger.error("Error querying database", { sql, params, error });
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        logger.info("Database connection closed");
        this.isConnected = false;
      } catch (error) {
        logger.error("Error closing database connection", { error });
        throw error;
      }
    }
  }
}

export default DB;

export { DB };
