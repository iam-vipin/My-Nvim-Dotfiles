import { DirectConnection, Hocuspocus } from "@hocuspocus/server";
import type { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import type { Doc } from "yjs";
import { logger } from "@plane/logger";
import { type TPage } from "@plane/types";
import { DocumentProcessor } from "@/lib/document-processor/document-processor";
import { AppError } from "@/lib/errors";
import { getPageService } from "@/services/page/handler";
import { HocusPocusServerContext } from "@/types";

/**
 * Metadata for a stored connection
 */
interface ConnectionData {
  connection: DirectConnection;
  context: Partial<HocusPocusServerContext>;
  createdAt: number;
  lastUsed: number;
}

/**
 * Connection statistics for a document
 */
interface ConnectionStats {
  documentId: string;
  createdAt: string;
  lastUsed: string;
  idleTime: string;
}

/**
 * Overall statistics for the connection manager
 */
interface ManagerStats {
  totalConnections: number;
  connections: ConnectionStats[];
}

/**
 * Error thrown when the ServerAgentManager is not properly initialized
 */

/**
 * Manages server-side connections (agents) to the Hocuspocus server
 * Implements the Singleton pattern to ensure only one instance exists
 */
export class ServerAgentManager {
  private static instance: ServerAgentManager;
  private connections: Map<string, ConnectionData>;
  public hocuspocusServer: Hocuspocus | null;
  private cleanupInterval: ReturnType<typeof setInterval> | null;
  private pending: Map<string, Promise<ConnectionData>>;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.connections = new Map<string, ConnectionData>();
    this.hocuspocusServer = null;
    this.cleanupInterval = null;
    this.pending = new Map<string, Promise<ConnectionData>>();
  }

  /**
   * Get the singleton instance of the ServerAgentManager
   * @returns {ServerAgentManager} The singleton instance
   */
  public static getInstance(): ServerAgentManager {
    if (!ServerAgentManager.instance) {
      ServerAgentManager.instance = new ServerAgentManager();
    }
    return ServerAgentManager.instance;
  }

  /**
   * Initialize the manager with a Hocuspocus server instance
   * @param {Hocuspocus} server - The Hocuspocus server instance
   * @returns {ServerAgentManager} The initialized manager instance for chaining
   */
  public initialize(server: Hocuspocus): ServerAgentManager {
    this.hocuspocusServer = server;

    // Set up periodic cleanup of unused connections
    this.startConnectionCleanup();

    // Note: onDisconnect hook is now configured in HocusPocusServerManager
    // to avoid calling server.configure() which triggers all extensions' onConfigure again

    logger.info("SERVER_AGENT: initialized");
    return this;
  }

  /**
   * Get or create a connection to a document
   * @param {string} documentId - The document ID to connect to
   * @param {HocusPocusServerContext} context - Additional context for the connection
   * @returns {Promise<ConnectionData>} - The connection data object
   * @throws {AppError} If the manager is not initialized
   */
  public async getConnection(documentId: string, context: Partial<HocusPocusServerContext>): Promise<ConnectionData> {
    if (!this.hocuspocusServer) {
      throw new AppError("ServerAgentManager not initialized with a Hocuspocus server");
    }

    // Check if we already have a connection for this document
    const existingConnection = this.connections.get(documentId);
    if (existingConnection) {
      // Update last used timestamp and reuse connection
      // Note: DirectConnection.transact() will throw if connection is closed,
      // which is the appropriate error handling
      existingConnection.lastUsed = Date.now();
      logger.debug("SERVER_AGENT: Reusing existing DirectConnection", {
        documentId,
        age: Date.now() - existingConnection.createdAt,
        totalConnections: this.connections.size,
      });
      return existingConnection;
    }

    // Check if there's already a pending connection request for this document
    const pendingConnection = this.pending.get(documentId);
    if (pendingConnection) {
      logger.debug("SERVER_AGENT: Waiting for in-flight DirectConnection", { documentId });
      return pendingConnection;
    }

    // Create a new connection promise to prevent race conditions
    context.documentType = context.documentType === "sync_agent" ? "sync_agent" : "server_agent";
    const connectionPromise = (async () => {
      try {
        // Create a new connection
        const connection = await this.hocuspocusServer!.openDirectConnection(documentId, {
          documentType: context.documentType,
          projectId: context.projectId,
          workspaceSlug: context.workspaceSlug,
          // triggerExecutionAfterLoad: context.triggerExecutionAfterLoad,
          agentId: uuidv4(), // Unique ID for this server agent
        });

        // Store the connection with metadata
        const connectionData: ConnectionData = {
          connection,
          context,
          createdAt: Date.now(),
          lastUsed: Date.now(),
        };

        this.connections.set(documentId, connectionData);
        logger.debug("SERVER_AGENT: Created new DirectConnection", { documentId });

        return connectionData;
      } catch (error) {
        const appError = new AppError(error, {
          context: {
            operation: "getConnection",
            documentId,
          },
        });
        logger.error("Failed to create connection", appError);
        throw appError;
      }
    })();

    // Store the promise to prevent concurrent connection attempts
    this.pending.set(documentId, connectionPromise);

    try {
      return await connectionPromise;
    } finally {
      // Clean up the pending promise
      this.pending.delete(documentId);
    }
  }

  /**
   * Execute a synchronous transaction on a document
   * IMPORTANT: transactionFn MUST be synchronous. Async callbacks are not supported
   * because Hocuspocus DirectConnection.transact() calls the callback without awaiting.
   * For async operations (I/O, API calls), do them BEFORE calling this method.
   *
   * @param {string} documentId - The document ID
   * @param {(doc: Doc) => void} transactionFn - The SYNCHRONOUS transaction function
   * @param {HocusPocusServerContext} context - Additional context for the connection
   * @returns {Promise<boolean>} - Promise that resolves when the transaction is complete
   * @throws {AppError} If the transaction fails
   */
  public async executeTransaction(
    documentId: string,
    transactionFn: (_doc: Doc) => void,
    context: Partial<HocusPocusServerContext>,
    res?: Response
  ): Promise<boolean> {
    let connectionData: ConnectionData | null = null;

    try {
      connectionData = await this.getConnection(documentId, context);
      connectionData.lastUsed = Date.now();

      // Execute the transaction (context is already set in getConnection)
      await connectionData.connection.transact(transactionFn);

      return true;
    } catch (error) {
      // Clean up stale/closed connection on failure
      if (connectionData) {
        try {
          connectionData.connection.disconnect();
        } catch (disconnectError) {
          // Connection may already be closed, ignore error
        }
        this.connections.delete(documentId);
      }

      const appError = new AppError(error, {
        context: {
          operation: "executeTransaction",
          documentId,
          documentType: context.documentType,
        },
      });
      logger.error("Transaction failed", appError);

      // Notify about transaction failure if needed
      this.notifyTransactionFailure(documentId, appError.message, res);

      return false;
    }
  }

  public async notifySyncTrigger(
    pageId: string,
    context: HocusPocusServerContext,
    options: {
      componentType?: string;
      targetNodeId?: string;
      [key: string]: any;
    } = {}
  ): Promise<void> {
    if (!this.hocuspocusServer) return;

    try {
      let subPagesFromBackend: TPage[] | undefined = [];
      if (context.documentType) {
        const service = getPageService(context.documentType, context);
        subPagesFromBackend = await service.fetchSubPageDetails(pageId);
      }

      await this.executeTransaction(
        pageId,
        (doc) => {
          const xmlFragment = doc.getXmlFragment("default");

          // Process the document with fetched data
          DocumentProcessor.process({
            xmlFragment,
            subPages: subPagesFromBackend || [],
            options,
            context,
            instance: this.hocuspocusServer,
            documentName: pageId,
          });
        },
        {
          ...context,
          documentType: "sync_agent",
        }
      );
    } finally {
      await this.releaseConnection(pageId).catch((err) =>
        logger.error(`SERVER_AGENT: Failed to release sync connection for ${pageId}:`, err)
      );
    }
  }

  /**
   * Notify clients about a successful transaction
   * @private
   * @param {string} documentId - The document ID
   */
  public notifyTransactionSuccess(documentId: string, _res?: Response): void {
    if (!this.hocuspocusServer) return;

    const document = this.hocuspocusServer.documents.get(documentId);
    if (!document) return;

    try {
      logger.info(`Notified transaction success for ${documentId}:`);
    } catch (error) {
      const appError = new AppError(error, { context: { pageId: documentId } });
      logger.error(`Error notifying transaction success for ${documentId}:`, appError);
    }
  }

  /**
   * Notify clients about a failed transaction
   * @private
   * @param {string} documentId - The document ID
   * @param {string} errorMessage - The error message
   */
  private notifyTransactionFailure(documentId: string, _errorMessage: string, _res?: Response): void {
    if (!this.hocuspocusServer) return;

    const document = this.hocuspocusServer.documents.get(documentId);
    if (!document) return;

    try {
      // res.status(200).json({ success: true });
      // document.broadcastStateless(
      //   JSON.stringify({
      //     type: "transaction_status",
      //     status: "error",
      //     message: errorMessage,
      //     timestamp: new Date().toISOString(),
      //   })
      // );
    } catch (error) {
      const appError = new AppError(error, { context: { pageId: documentId } });
      logger.error(`Error notifying transaction failure for ${documentId}:`, appError);
    }
  }

  /**
   * Release a connection when it's no longer needed
   * @param {string} documentId - The document ID
   * @returns {Promise<void>}
   */
  public async releaseConnection(documentId: string): Promise<void> {
    const connectionData = this.connections.get(documentId);
    if (!connectionData) {
      return;
    }

    // Check if hocuspocus server is still available
    if (!this.hocuspocusServer) {
      logger.warn("SERVER_AGENT: Cannot release connection - HocusPocus server is null", { documentId });
      this.connections.delete(documentId);
      return;
    }

    try {
      // Disconnect DirectConnection (triggers Hocuspocus cleanup)
      connectionData.connection.disconnect();
    } catch (error) {
      const appError = new AppError(error, {
        context: {
          operation: "releaseConnection",
          documentId,
        },
      });
      logger.error("Error releasing connection", appError);
    } finally {
      // ALWAYS remove from map and break reference cycles
      this.connections.delete(documentId);
      connectionData.context = {};
    }
  }

  /**
   * Check if a document has any client connections (excluding our agent)
   * @param {string} documentId - The document ID
   * @returns {boolean} - True if there are client connections
   */
  public hasClientConnections(documentId: string): boolean {
    if (!this.hocuspocusServer) return false;

    // Get the document from the server
    const document = this.hocuspocusServer.documents.get(documentId);
    if (!document) return false;

    // Exclude the agent connection from the count
    // document.connections.size = WebSocket connections
    // directConnectionsCount = our agent connections
    const agentPresent = this.connections.has(documentId) ? 1 : 0;
    const clientCount = Math.max(0, document.connections.size + document.directConnectionsCount - agentPresent);

    return clientCount > 0;
  }

  /**
   * Start periodic cleanup of unused connections
   * @private
   */
  private startConnectionCleanup(): void {
    // Check every 5 minutes for unused connections
    const CLEANUP_INTERVAL = 5 * 60 * 1000;

    // Clear any existing interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupUnusedConnections().catch((error) => {
        const appError = new AppError(error, {
          context: {
            operation: "cleanupUnusedConnections",
          },
        });
        logger.error("Error during connection cleanup", appError);
      });
    }, CLEANUP_INTERVAL);
  }

  /**
   * Clean up connections that are no longer needed
   * @private
   */
  private async cleanupUnusedConnections(): Promise<void> {
    const documentsToCleanup: string[] = [];

    for (const [documentId] of this.connections.entries()) {
      // If no client connections exist (only our agent remains), schedule cleanup
      if (!this.hasClientConnections(documentId)) {
        documentsToCleanup.push(documentId);
      }
    }

    // Release connections outside the loop to avoid modifying the map during iteration
    for (const documentId of documentsToCleanup) {
      logger.info(`SERVER_AGENT: Cleaning up connection for document with no clients: ${documentId}`);
      await this.releaseConnection(documentId);
    }

    if (documentsToCleanup.length > 0) {
      logger.info(`SERVER_AGENT: Cleaned up ${documentsToCleanup.length} connections with no clients`);
    }
  }

  /**
   * Check if a document has no client connections and release the agent if needed
   * @param {string} documentId - The document ID to check
   * @returns {Promise<boolean>} - True if the connection was released
   */
  public async checkAndReleaseIfNoClients(documentId: string): Promise<boolean> {
    if (!this.connections.has(documentId)) {
      return false;
    }

    if (!this.hasClientConnections(documentId)) {
      logger.info(`SERVER_AGENT: No clients left for document ${documentId}, releasing agent connection`);
      await this.releaseConnection(documentId);
      return true;
    }

    return false;
  }

  /**
   * Get statistics about current connections
   * @returns {ManagerStats} - Connection statistics
   */
  public getStats(): ManagerStats {
    return {
      totalConnections: this.connections.size,
      connections: Array.from(this.connections.entries()).map(([documentId, data]) => ({
        documentId,
        createdAt: new Date(data.createdAt).toISOString(),
        lastUsed: new Date(data.lastUsed).toISOString(),
        idleTime: Math.round((Date.now() - data.lastUsed) / 1000) + "s",
      })),
    };
  }

  /**
   * Get detailed metrics about connection manager performance
   * @returns Detailed metrics object
   */
  public getMetrics() {
    const now = Date.now();
    const connections = Array.from(this.connections.entries());

    // Calculate age and idle time statistics
    const ages = connections.map(([_, data]) => now - data.createdAt);
    const idleTimes = connections.map(([_, data]) => now - data.lastUsed);

    return {
      connections: {
        total: this.connections.size,
        oldestAge: ages.length > 0 ? Math.max(...ages) : 0,
        averageAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
        maxIdleTime: idleTimes.length > 0 ? Math.max(...idleTimes) : 0,
        averageIdleTime: idleTimes.length > 0 ? idleTimes.reduce((a, b) => a + b, 0) / idleTimes.length : 0,
      },
      hocuspocus: this.hocuspocusServer
        ? {
            documentsLoaded: this.hocuspocusServer.getDocumentsCount(),
            totalConnections: this.hocuspocusServer.getConnectionsCount(),
          }
        : null,
      cleanup: {
        intervalActive: this.cleanupInterval !== null,
      },
    };
  }

  /**
   * Shutdown the manager and clean up all connections
   * @returns {Promise<void>}
   */
  public async shutdown(): Promise<void> {
    // Clear the cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Release all connections
    const documentIds = Array.from(this.connections.keys());
    for (const documentId of documentIds) {
      await this.releaseConnection(documentId);
    }

    logger.info("SERVER_AGENT: ServerAgentManager shut down successfully");
  }
}

// Create and export the singleton instance
export const serverAgentManager = ServerAgentManager.getInstance();
