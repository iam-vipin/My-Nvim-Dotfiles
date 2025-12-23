import { logger } from "@plane/logger";
import { captureException } from "@/logger";

/**
 * Graceful shutdown function that handles cleanup and process termination
 * @param reason - Reason for shutdown
 * @param error - Optional error that caused the shutdown
 * @param exitCode - Exit code (default: 1 for errors)
 */
export function shutdown(reason: string, error?: Error, exitCode: number = 1): never {
  logger.error(`🚨 CRITICAL: Initiating server shutdown - ${reason}`, {
    reason,
    error: error?.message,
    stack: error?.stack,
    exitCode,
  });

  if (error) {
    captureException(error);
  }

  // Give a brief moment for logging to complete
  setTimeout(() => {
    process.exit(exitCode);
  }, 100);

  // This never executes but satisfies TypeScript's never return type
  throw new Error("Shutdown initiated");
}
