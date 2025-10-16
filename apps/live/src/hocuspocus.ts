import { Hocuspocus } from "@hocuspocus/server";
import { v4 as uuidv4 } from "uuid";
// env
import { logger } from "@plane/logger";
import { env } from "@/env";
// extensions
import { getExtensions } from "@/extensions";
// lib
import { onAuthenticate } from "@/lib/auth";
import { onStateless } from "@/lib/stateless";
import { serverAgentManager } from "./agents/server-agent";
import { AppError } from "./lib/errors";

export class HocusPocusServerManager {
  private static instance: HocusPocusServerManager | null = null;
  private server: Hocuspocus | null = null;
  // server options
  private serverName = env.HOSTNAME || uuidv4();

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Get the singleton instance of HocusPocusServerManager
   */
  public static getInstance(): HocusPocusServerManager {
    if (!HocusPocusServerManager.instance) {
      HocusPocusServerManager.instance = new HocusPocusServerManager();
    }
    return HocusPocusServerManager.instance;
  }

  /**
   * Initialize and configure the HocusPocus server
   */
  public async initialize(): Promise<Hocuspocus> {
    if (this.server) {
      return this.server;
    }

    this.server = new Hocuspocus({
      name: this.serverName,
      onAuthenticate,
      onStateless,
      extensions: getExtensions(),
      debounce: 10000,
      maxDebounce: 50000,
      // Add onDisconnect hook during construction to avoid calling configure() later
      onDisconnect: async ({ documentName }) => {
        setTimeout(() => {
          // Use setTimeout to ensure Hocuspocus has updated connection counts
          serverAgentManager.checkAndReleaseIfNoClients(documentName).catch((error) => {
            const appError = new AppError(error, {
              context: {
                operation: "onDisconnect",
                documentName,
              },
            });
            logger.error("SERVER_AGENT: Error checking client connections", appError);
          });
        }, 0);
      },
    });

    return this.server;
  }

  /**
   * Get the configured server instance
   */
  public getServer(): Hocuspocus | null {
    return this.server;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    HocusPocusServerManager.instance = null;
  }
}
