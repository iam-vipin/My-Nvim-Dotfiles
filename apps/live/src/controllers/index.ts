import { AdminController } from "./admin.controller";
import { BroadcastController } from "./broadcast.controller";
import { CollaborationController } from "./collaboration.controller";
import { ContentController } from "./content.controller";
import { DocumentController } from "./document.controller";
import { HealthController } from "./health.controller";
import { IframelyController } from "./iframely.controller";
import { LiveDocumentController } from "./live-document.controller";
import { MarkdownConversionController } from "./markdown-conversion.controller";

export const CONTROLLERS = [
  // Core system controllers (health checks, status endpoints)
  HealthController,
  // Admin operations (protected endpoints)
  AdminController,
  // Document management controllers
  DocumentController,
  LiveDocumentController,
  // Content service
  ContentController,
  IframelyController,
  MarkdownConversionController,
  // websocket
  CollaborationController,
  BroadcastController,
];
