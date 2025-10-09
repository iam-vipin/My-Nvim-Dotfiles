import { BroadcastController } from "./broadcast.controller";
import { CollaborationController } from "./collaboration.controller";
import { ContentController } from "./content.controller";
import { ConvertDocumentController } from "./convert-document.controller";
import { DocumentController } from "./document.controller";
import { HealthController } from "./health.controller";
import { IframelyController } from "./iframely.controller";
import { LiveDocumentController } from "./live-document.controller";

export const CONTROLLERS = [
  // Core system controllers (health checks, status endpoints)
  HealthController,
  // Document management controllers
  DocumentController,
  LiveDocumentController,
  ConvertDocumentController,
  // Content service
  ContentController,
  IframelyController,
  // websocket
  CollaborationController,
  BroadcastController,
];
