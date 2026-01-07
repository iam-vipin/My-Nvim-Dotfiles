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

import { setupSentry } from "./instrument";
setupSentry();

import { logger } from "@plane/logger";
import { AppError } from "@/lib/errors";
import { Server } from "./server";

let server: Server;

async function startServer() {
  server = new Server();
  try {
    await server.initialize();
    server.listen();
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Handle process signals
process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM signal. Initiating graceful shutdown...");
  try {
    if (server) {
      await server.destroy();
    }
    logger.info("Server shut down gracefully");
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("Received SIGINT signal. Killing node process...");
  try {
    if (server) {
      await server.destroy();
    }
    logger.info("Server shut down gracefully");
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
  process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
  const error = new AppError(err);
  logger.error(`[UNHANDLED_REJECTION]`, error);
});

process.on("uncaughtException", (err: Error) => {
  const error = new AppError(err);
  logger.error(`[UNCAUGHT_EXCEPTION]`, error);
});
