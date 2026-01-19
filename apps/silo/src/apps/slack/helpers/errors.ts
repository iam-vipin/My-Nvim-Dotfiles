/* ------------------- Exceptions ---------------------- */

import { logger } from "@plane/logger";
import type { E_INTEGRATION_KEYS } from "@plane/types";

/**
 * Exception thrown when work object details cannot be found or retrieved
 */
export class DetailsNotFoundException extends Error {
  constructor(
    provider: E_INTEGRATION_KEYS,
    public readonly context?: unknown
  ) {
    const message = `[${provider}] No connection details found`;
    super(message);
    this.name = "DetailsNotFoundException";
    logger.info(message, this.context);
    Error.captureStackTrace(this, this.constructor);
  }
}
