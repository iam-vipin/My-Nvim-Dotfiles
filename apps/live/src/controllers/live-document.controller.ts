import type { Request, Response } from "express";
import * as Y from "yjs";
import { z } from "zod";
import { Controller, Get, Middleware } from "@plane/decorators";

// Server agent
import { getAllDocumentFormatsFromDocumentEditorBinaryData } from "@plane/editor/lib";

// Helpers
import { logger } from "@plane/logger";
import { serverAgentManager } from "@/agents/server-agent";
import { requireSecretKey } from "@/lib/auth-middleware";
import { AppError } from "@/lib/errors";
// Import authentication middleware
import { HocusPocusServerContext } from "@/types";

// Types

// Schema for request validation
const getLiveDocumentValuesSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  variant: z.enum(["document"]),
  workspaceSlug: z.string().min(1, "Workspace slug is required"),
});

@Controller("/live-document")
export class LiveDocumentController {
  @Get("/")
  @Middleware(requireSecretKey)
  async getLiveDocumentValues(req: Request, res: Response) {
    try {
      const validatedData = getLiveDocumentValuesSchema.parse(req.query);
      const { documentId, workspaceSlug } = validatedData;

      const context: Partial<HocusPocusServerContext> = {
        workspaceSlug,
      };

      try {
        const { connection } = await serverAgentManager.getConnection(documentId, context);

        // Define the document type
        type DocumentData = {
          description_binary: string;
          description: object;
          description_html: string;
          name?: string;
        };

        // Create a promise to wrap the setTimeout
        const loadDocumentWithDelay = new Promise<DocumentData | null>((resolve) => {
          let documentData: DocumentData;

          connection.transact((doc) => {
            const type = doc.getXmlFragment("default");
            const contentDoc = type.doc;

            if (!contentDoc) {
              resolve(null);
              return;
            }

            const yjsBinary = Y.encodeStateAsUpdate(contentDoc);
            const { contentBinaryEncoded, contentJSON, contentHTML, titleHTML } =
              getAllDocumentFormatsFromDocumentEditorBinaryData(yjsBinary, true);

            documentData = {
              description_binary: contentBinaryEncoded,
              description: contentJSON,
              description_html: contentHTML,
            };

            if (titleHTML) {
              documentData.name = titleHTML;
            }

            resolve(documentData);
          });
        });

        // Await the delayed document loading
        const documentLoaded = await loadDocumentWithDelay;

        await serverAgentManager.releaseConnection(documentId);

        // Return the converted document
        res.status(200).json(documentLoaded);
      } catch (error) {
        const appError = new AppError(error, {
          context: {
            pageId: documentId,
          },
        });

        // Error during server agent connection or conversion
        logger.error(`Error processing document ${documentId}:`, appError);

        res.status(400).json({
          loaded: false,
          message: "Document not currently loaded in memory",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        logger.error("Validation error", {
          validationErrors,
        });
        return res.status(500).json({
          message: `Internal server error.`,
          context: {
            validationErrors,
          },
        });
      } else {
        const appError = new AppError(error);
        logger.error("Error in /live-document endpoint:", appError);
        // Handle other errors
        return res.status(500).json({
          message: `Internal server error.`,
        });
      }
    }
  }
}
