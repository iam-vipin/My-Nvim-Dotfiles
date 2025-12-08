import type { Hocuspocus } from "@hocuspocus/server";
import type { Request, Response } from "express";
import { Controller, Post, Middleware } from "@plane/decorators";
import { logger } from "@plane/logger";
// Import the force close utility
import { forceCloseDocumentAcrossServers } from "@/extensions/force-close-handler";
import { requireSecretKey } from "@/lib/auth-middleware";
import { ForceCloseReason, CloseCode, isValidForceCloseReason } from "@/types/admin-commands";
// Import authentication middleware

/**
 * Admin controller for protected administrative operations
 * All endpoints require secret key authentication
 */
@Controller("/admin")
export class AdminController {
  private readonly hocuspocusServer: Hocuspocus;

  constructor(hocuspocusServer: Hocuspocus) {
    this.hocuspocusServer = hocuspocusServer;
  }

  /**
   * POST /admin/force-close/:pageId
   *
   * Force close a document across all servers and unload it from memory.
   * Useful for handling critical errors or manually intervening when a document is stuck.
   *
   * Headers:
   *   live-server-secret-key: <secret-key> (required)
   *
   * Query params:
   *   reason: string (optional) - Reason for force closing (default: "admin_triggered")
   *
   * Example:
   *   POST /admin/force-close/page-123?reason=memory_leak
   *   Headers: x-admin-secret-key: your-secret-key
   */
  @Post("/force-close/:pageId")
  @Middleware(requireSecretKey)
  async forceCloseDocument(req: Request, res: Response) {
    const { pageId } = req.params;
    const { reason } = req.query;

    // Validate pageId
    if (!pageId || typeof pageId !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing or invalid pageId parameter",
        status: 400,
      });
    }

    const errorCode = (reason as string) || "admin_triggered";

    logger.info(`
╔════════════════════════════════════════════════════════════════════
║ [ADMIN] Force close request received
║ Document: ${pageId}
║ Reason: ${errorCode}
║ IP: ${req.ip}
║ User-Agent: ${req.headers["user-agent"]}
╚════════════════════════════════════════════════════════════════════
    `);

    try {
      // Check if document exists
      const document = this.hocuspocusServer.documents.get(pageId);

      if (!document) {
        logger.warn(`
⚠️  [ADMIN] Document not found
   Document: ${pageId}
   Available documents: ${this.hocuspocusServer.documents.size}
        `);

        return res.status(404).json({
          error: "Not Found",
          message: `Document "${pageId}" not found in server memory`,
          status: 404,
          availableDocuments: this.hocuspocusServer.documents.size,
        });
      }

      // Get info before closing
      const connectionsBefore = document.getConnectionsCount();

      // Validate and map error code to ForceCloseReason
      let reason: ForceCloseReason;
      if (isValidForceCloseReason(errorCode)) {
        reason = errorCode;
      } else {
        logger.warn(`[ADMIN] Invalid error code "${errorCode}", defaulting to ADMIN_REQUEST`);
        reason = ForceCloseReason.ADMIN_REQUEST;
      }

      // Execute force close with proper types
      await forceCloseDocumentAcrossServers(this.hocuspocusServer, pageId, reason, CloseCode.FORCE_CLOSE);

      // Verify document was removed
      const stillExists = this.hocuspocusServer.documents.has(pageId);

      if (stillExists) {
        logger.error(`
❌ [ADMIN] Force close failed - document still in memory
   Document: ${pageId}
        `);

        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to remove document from memory",
          status: 500,
          documentId: pageId,
          stillInMemory: true,
        });
      }

      logger.info(`
✅ [ADMIN] Force close successful
   Document: ${pageId}
   Connections closed: ${connectionsBefore}
   Document removed: Yes
      `);

      return res.status(200).json({
        success: true,
        message: "Document force-closed successfully",
        documentId: pageId,
        reason: errorCode,
        connectionsClosed: connectionsBefore,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(
        `
❌ [ADMIN] Error during force close:`,
        error
      );

      return res.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        status: 500,
        documentId: pageId,
      });
    }
  }

  /**
   * POST /admin/documents
   *
   * List all documents currently loaded in server memory
   *
   * Headers:
   *   x-admin-secret-key: <secret-key> (required)
   */
  @Post("/documents")
  @Middleware(requireSecretKey)
  async listDocuments(req: Request, res: Response) {
    const documents: Array<{
      id: string;
      connections: number;
    }> = [];

    this.hocuspocusServer.documents.forEach((doc, id) => {
      documents.push({
        id,
        connections: doc.getConnectionsCount(),
      });
    });

    logger.info(`
ℹ️  [ADMIN] Documents list requested
   Total documents: ${documents.length}
   IP: ${req.ip}
    `);

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
      timestamp: new Date().toISOString(),
    });
  }
}
