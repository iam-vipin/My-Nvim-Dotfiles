import { BroadcastController } from "./broadcast.controller";
import { CollaborationController } from "./collaboration.controller";
import { ConvertDocumentController } from "./convert-document.controller";
import { DocumentController } from "./document.controller";
import { HealthController } from "./health.controller";
import { LiveDocumentController } from "./live-document.controller";

export const CONTROLLERS = [
  // Core system controllers (health checks, status endpoints)
  HealthController,
  // Document management controllers
  DocumentController,
  LiveDocumentController,
  ConvertDocumentController,
  // websocket
  CollaborationController,
  BroadcastController,
];
