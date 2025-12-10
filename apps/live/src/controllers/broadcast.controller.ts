import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as Y from "yjs";
import { Controller, Middleware, Post } from "@plane/decorators";
import { createRealtimeEvent } from "@plane/editor/lib";
import type { BroadcastPayloadUnion, CommonRealtimeFields, TDocumentEventsClient } from "@plane/editor/lib";
import { logger } from "@plane/logger";
import { serverAgentManager } from "@/agents/server-agent";
import { requireSecretKey } from "@/lib/auth-middleware";
import { AppError } from "@/lib/errors";
import { findAllElementsRecursive, insertNodeAfter, deleteNode } from "@/utils";
import { broadcastMessageToPage } from "@/utils/broadcast-message";

// (Optional) additional types used in your controller
interface ConnectionContext {
  workspaceSlug: string;
  projectId?: string;
  teamspaceId?: string;
}

// If needed, you can also define a metadata type.
// Here, we rely on the output of createRealtimeEvent.
export interface CompleteMetadata extends CommonRealtimeFields {
  action: TDocumentEventsClient;
  data: Record<string, any>;
}

@Controller("/broadcast")
export class BroadcastController {
  @Post("/")
  @Middleware(requireSecretKey)
  async handleBroadcast(req: Request<any, any, BroadcastPayloadUnion>, res: Response) {
    try {
      const payload = req.body;
      // Destructure common properties
      const { action, descendants_ids, page_id, parent_id, data, workspace_slug, user_id, project_id, teamspace_id } =
        payload;

      // Add user_id to data
      data.user_id = user_id;

      // Create a complete metadata object using our helper
      const completeMetadata = createRealtimeEvent({
        action,
        page_id,
        parent_id,
        descendants_ids,
        data,
        workspace_slug: workspace_slug || "",
        project_id: project_id || "",
        teamspace_id: teamspace_id || "",
        user_id: user_id || "",
      });

      // Collect all affected page IDs
      const affectedPageIds = this.collectAffectedPageIds(payload);

      // Broadcast to all affected pages
      this.broadcastToAffectedPages(affectedPageIds, completeMetadata);

      // Create a context object for later operations
      const connectionContext: ConnectionContext = {
        workspaceSlug: workspace_slug || "",
        projectId: project_id || "",
        teamspaceId: teamspace_id || "",
      };

      res.status(200).json({ success: true });

      // Handle specific actions with early returns
      if (action === "moved_internally" && page_id) {
        await this.handleMovedInternally(payload, connectionContext);
        return;
      }

      if (action === "duplicated" && parent_id && page_id) {
        await this.handleDuplicated(payload, connectionContext);
        return;
      }

      if (action === "deleted" && parent_id && page_id) {
        await this.handleDeleted(payload, connectionContext);
        return;
      }

      if (action === "sub_page") {
        await this.handleSubPage(payload, connectionContext);
        return;
      }
    } catch (error) {
      const appError = new AppError(error, {
        context: { operation: "broadcastHandleBroadcast" },
      });
      logger.error("Error in broadcast handler", appError);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  private collectAffectedPageIds(payload: BroadcastPayloadUnion): string[] {
    const { page_id, parent_id, descendants_ids, action, data } = payload;
    const affectedPageIds = [...(page_id ? [page_id] : []), ...(parent_id ? [parent_id] : []), ...descendants_ids];

    // Add special IDs for moved_internally action
    if (action === "moved_internally") {
      if (data?.new_parent_id) affectedPageIds.push(data.new_parent_id);
      if (data?.old_parent_id) affectedPageIds.push(data.old_parent_id);
    }

    if (action === "restored") {
      if (data?.deleted_page_ids) affectedPageIds.push(...data.deleted_page_ids);
    }

    return affectedPageIds.filter(Boolean);
  }

  private broadcastToAffectedPages(pageIds: string[], metadata: CompleteMetadata): void {
    pageIds.forEach((pageId) => {
      try {
        if (!serverAgentManager.hocuspocusServer) return;
        broadcastMessageToPage(serverAgentManager.hocuspocusServer, pageId, metadata);
      } catch (error) {
        const appError = new AppError(error, {
          context: { operation: "broadcastToAffectedPages", pageId },
        });
        logger.error("Error broadcasting to page", appError);
      }
    });
  }

  private async handleMovedInternally(payload: BroadcastPayloadUnion, context: ConnectionContext): Promise<void> {
    if (payload.action !== "moved_internally" || !payload.page_id) return;

    const { page_id, workspace_slug, data } = payload;
    const old_parent_id = data?.old_parent_id || null;
    const new_parent_id = data?.new_parent_id || null;

    // Handle old parent (remove page embed)
    if (old_parent_id) {
      await this.removePageEmbedFromParent(old_parent_id, page_id, context);
    }

    // Handle new parent (add page embed)
    if (new_parent_id) {
      await this.addPageEmbedToParent(new_parent_id, page_id, workspace_slug || "", context);
    }
  }

  private async handleDuplicated(payload: BroadcastPayloadUnion, context: ConnectionContext): Promise<void> {
    if (payload.action !== "duplicated" || !payload.parent_id || !payload.page_id) return;
    if (!payload.data || !payload.data.new_page_id) return;

    const { parent_id, page_id, data, workspace_slug } = payload;

    try {
      await serverAgentManager.executeTransaction(
        parent_id,
        (doc) => {
          const xmlFragment = doc.getXmlFragment("default");
          const matchingEmbeds = findAllElementsRecursive(
            xmlFragment,
            "pageEmbedComponent",
            "entity_identifier",
            page_id
          );

          if (matchingEmbeds.length > 0) {
            matchingEmbeds.forEach(({ parent, indexInParent }) => {
              const newPageEmbedNode = new Y.XmlElement("pageEmbedComponent");
              newPageEmbedNode.setAttribute("entity_identifier", data.new_page_id);
              newPageEmbedNode.setAttribute("entity_name", "sub_page");
              newPageEmbedNode.setAttribute("id", uuidv4());
              newPageEmbedNode.setAttribute("workspace_identifier", workspace_slug || "");
              insertNodeAfter(parent, indexInParent, newPageEmbedNode);
            });
          }
        },
        context
      );
    } catch (error) {
      logger.error("BROADCAST_CONTROLLER: Error handling duplicated action:", error);
    }
  }

  private async handleSubPage(payload: BroadcastPayloadUnion, context: ConnectionContext): Promise<void> {
    if (payload.action !== "sub_page" || !payload.parent_id || !payload.page_id) return;

    const { parent_id, page_id } = payload;

    await this.addPageEmbedToParent(parent_id, page_id, context.workspaceSlug || "", context);
  }

  private async handleDeleted(payload: BroadcastPayloadUnion, context: ConnectionContext): Promise<void> {
    if (payload.action !== "deleted" || !payload.parent_id || !payload.page_id) return;

    const { parent_id, page_id } = payload;

    try {
      await serverAgentManager.executeTransaction(
        parent_id,
        (doc) => {
          const xmlFragment = doc.getXmlFragment("default");
          const matchingEmbeds = findAllElementsRecursive(
            xmlFragment,
            "pageEmbedComponent",
            "entity_identifier",
            page_id
          );

          if (matchingEmbeds.length > 0) {
            for (let i = matchingEmbeds.length - 1; i >= 0; i--) {
              const { parent, indexInParent } = matchingEmbeds[i];
              deleteNode(parent, indexInParent);
            }
          }
        },
        context
      );
    } catch (error) {
      const appError = new AppError(error, {
        context: { operation: "broadcastHandleDeleted", parentId: parent_id, pageId: page_id },
      });
      logger.error("Error handling deleted action", appError);
    }
  }

  private async removePageEmbedFromParent(parentId: string, pageId: string, context: ConnectionContext): Promise<void> {
    try {
      await serverAgentManager.executeTransaction(
        parentId,
        (doc) => {
          const xmlFragment = doc.getXmlFragment("default");

          const matchingEmbeds = findAllElementsRecursive(
            xmlFragment,
            "pageEmbedComponent",
            "entity_identifier",
            pageId
          );

          if (matchingEmbeds.length > 0) {
            for (let i = matchingEmbeds.length - 1; i >= 0; i--) {
              const { parent, indexInParent } = matchingEmbeds[i];
              deleteNode(parent, indexInParent);
            }
          }
        },
        context
      );
    } catch (error) {
      const appError = new AppError(error, {
        context: { operation: "broadcastRemovePageEmbedFromParent", parentPageId: parentId, pageId },
      });
      logger.error("Error removing from old parent", appError);
    }
  }

  private async addPageEmbedToParent(
    parentId: string,
    pageId: string,
    workspaceSlug: string,
    context: ConnectionContext
  ): Promise<void> {
    try {
      await serverAgentManager.executeTransaction(
        parentId,
        (doc) => {
          const xmlFragment = doc.getXmlFragment("default");
          const newPageEmbedNode = new Y.XmlElement("pageEmbedComponent");
          newPageEmbedNode.setAttribute("entity_identifier", pageId);
          newPageEmbedNode.setAttribute("entity_name", "sub_page");
          newPageEmbedNode.setAttribute("id", uuidv4());
          newPageEmbedNode.setAttribute("workspace_identifier", workspaceSlug);
          xmlFragment.push([newPageEmbedNode]);
        },
        context
      );
    } catch (error) {
      const appError = new AppError(error, {
        context: { operation: "broadcastAddPageEmbedToParent", parentPageId: parentId, pageId },
      });
      logger.error("Error adding to new parent", appError);
    }
  }
}
