export type ConnectionStatus =
  | "initial"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export type SyncStatus =
  | "syncing"
  | "synced";

export type CollaborationError =
  | { type: "auth-failed"; message: string }
  | { type: "network-error"; message: string }
  | { type: "forced-close"; code: number; message: string }
  | { type: "max-retries"; message: string };

export type CollaborationState = {
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  error?: CollaborationError;
};

export type TServerHandler = {
  onStateChange: (state: CollaborationState) => void;
};
