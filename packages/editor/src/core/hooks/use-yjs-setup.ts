import { HocuspocusProvider } from "@hocuspocus/provider";
// react
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
// indexeddb
import { IndexeddbPersistence } from "y-indexeddb";
// yjs
import * as Y from "yjs";
// types
import type { CollaborationState, ConnectionStatus, SyncStatus } from "@/types/collaboration";

// Helper to check if a close code indicates a forced close
const isForcedCloseCode = (code: number | undefined): boolean => {
  if (!code) return false;
  // All custom close codes (4000-4003) are treated as forced closes
  return code >= 4000 && code <= 4003;
};

// Collaboration state type
type CollaborationStore = {
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  error?: CollaborationState["error"];
  isContentInIndexedDb: boolean;
  isIndexedDbSynced: boolean;
};

type UseYjsSetupArgs = {
  id: string;
  url: string;
  token: string;
  serverHandler?: {
    onStateChange: (state: CollaborationState) => void;
  };
  options?: {
    maxConnectionAttempts?: number;
  };
};

export const useYjsSetup = ({ id, url, token, serverHandler, options }: UseYjsSetupArgs) => {
  const maxConnectionAttempts = options?.maxConnectionAttempts ?? 3;

  // Use useReducer for stable dispatch
  const [collaborationState, dispatch] = useReducer(
    (state: CollaborationStore, patch: Partial<CollaborationStore>) => ({ ...state, ...patch }),
    {
      connectionStatus: "initial",
      syncStatus: "syncing",
      error: undefined,
      isContentInIndexedDb: false,
      isIndexedDbSynced: false,
    }
  );

  // Provider and Y.Doc in state (nullable until effect runs)
  const [setup, setSetup] = useState<{ provider: HocuspocusProvider; ydoc: Y.Doc } | null>(null);

  // Use refs for values that need to be mutated from callbacks
  const connectionAttemptsRef = useRef(0);
  const forceCloseReceivedRef = useRef(false);

  // Create/destroy provider in effect (not during render)
  useEffect(() => {
    let stopped = false;

    const provider = new HocuspocusProvider({
      name: id,
      token,
      url,
      onAuthenticationFailed: () => {
        if (stopped) return;
        console.log("[useYjsSetup] Authentication failed");
        dispatch({
          connectionStatus: "disconnected",
          syncStatus: "syncing",
          error: { type: "auth-failed", message: "Authentication failed" },
        });
      },
      onConnect: () => {
        if (stopped) return;
        connectionAttemptsRef.current = 0;
        dispatch({ connectionStatus: "connected", error: undefined });
      },
      onStatus: (status) => {
        if (stopped) return;
        if (status.status === "connecting") {
          const isReconnecting = connectionAttemptsRef.current > 0;
          dispatch({
            connectionStatus: isReconnecting ? "reconnecting" : "connecting",
            syncStatus: "syncing",
          });
        } else if (status.status === "disconnected") {
          dispatch({
            connectionStatus: "disconnected",
            syncStatus: "syncing",
            error: { type: "network-error", message: "Connection lost" },
          });
        } else if (status.status === "connected") {
          dispatch({ connectionStatus: "connected", error: undefined });
        }
      },
      onSynced: () => {
        if (stopped) return;
        connectionAttemptsRef.current = 0;
        dispatch({ syncStatus: "synced", error: undefined });

        let workspaceSlug: string | null = null;
        let projectId: string | null = null;
        try {
          const urlParams = new URL(url);
          workspaceSlug = urlParams.searchParams.get("workspaceSlug");
          projectId = urlParams.searchParams.get("projectId");
        } catch {
          // Ignore malformed URL
        }
        provider.sendStateless(
          JSON.stringify({
            action: "synced",
            workspaceSlug,
            projectId,
          })
        );
      },
    });

    const handleClose = (event: { event?: { code?: number; reason?: string } }) => {
      if (stopped) return;

      const closeCode = event.event?.code;
      const isForcedClose = isForcedCloseCode(closeCode) || forceCloseReceivedRef.current;

      if (isForcedClose) {
        dispatch({
          connectionStatus: "disconnected",
          syncStatus: "syncing",
          error: {
            type: "forced-close",
            code: closeCode || 0,
            message: "Server forced connection close",
          },
        });

        connectionAttemptsRef.current = 0;
        forceCloseReceivedRef.current = false;
        stopped = true;
        provider.destroy();
      } else {
        connectionAttemptsRef.current++;

        if (connectionAttemptsRef.current >= maxConnectionAttempts) {
          dispatch({
            connectionStatus: "disconnected",
            syncStatus: "syncing",
            error: {
              type: "max-retries",
              message: `Failed to connect after ${maxConnectionAttempts} attempts`,
            },
          });

          stopped = true;
          provider.destroy();
        } else {
          dispatch({
            connectionStatus: "reconnecting",
            syncStatus: "syncing",
            error: { type: "network-error", message: "Connection lost, reconnecting..." },
          });
        }
      }
    };

    provider.on("close", handleClose);

    setSetup({ provider, ydoc: provider.document as Y.Doc });

    return () => {
      stopped = true;
      try {
        provider.destroy();
      } catch (error) {
        console.error(`Error destroying provider:`, error);
      }
    };
  }, [id, url, token, maxConnectionAttempts]);

  // IndexedDB persistence lifecycle
  useEffect(() => {
    if (!setup) return;

    const localProvider = new IndexeddbPersistence(id, setup.provider.document);

    const handleIndexedDbSync = () => {
      const yFragment = localProvider.doc.getXmlFragment("default");
      const docLength = yFragment?.length ?? 0;
      dispatch({
        isIndexedDbSynced: true,
        isContentInIndexedDb: docLength > 0,
      });
    };

    localProvider.on("synced", handleIndexedDbSync);

    return () => {
      localProvider.off("synced", handleIndexedDbSync);
      try {
        localProvider.destroy();
      } catch (error) {
        console.error(`Error destroying local provider:`, error);
      }
    };
  }, [id, setup]);

  // Clear IndexedDB after server sync when document is empty
  useEffect(() => {
    if (!setup) return;
    if (!collaborationState.isIndexedDbSynced || collaborationState.syncStatus !== "synced") return;

    const yFragment = setup.ydoc.getXmlFragment("default");
    const docLength = yFragment?.length ?? 0;

    if (docLength === 0) {
      dispatch({ isContentInIndexedDb: false });
      // Note: Actual IndexedDB deletion deferred to avoid conflicts with active persistence
      // IndexedDB will be cleaned up naturally when user navigates away
    } else {
      dispatch({ isContentInIndexedDb: true });
    }
  }, [setup, collaborationState.isIndexedDbSynced, collaborationState.syncStatus, id]);

  // Notify server handler of state changes (use ref to avoid dependency on handler)
  const serverHandlerRef = useRef(serverHandler);
  serverHandlerRef.current = serverHandler;

  useEffect(() => {
    if (!serverHandlerRef.current) return;

    const state: CollaborationState = {
      connectionStatus: collaborationState.connectionStatus,
      syncStatus: collaborationState.syncStatus,
      error: collaborationState.error,
    };

    serverHandlerRef.current.onStateChange(state);
  }, [collaborationState.connectionStatus, collaborationState.syncStatus, collaborationState.error]);

  // Derived values
  const hasServerSynced = collaborationState.syncStatus === "synced";
  const hasServerConnectionFailed = collaborationState.connectionStatus === "disconnected";
  const isEditorContentReady =
    hasServerSynced ||
    hasServerConnectionFailed ||
    (collaborationState.isIndexedDbSynced && collaborationState.isContentInIndexedDb);

  const setForceCloseReceived = useCallback((value: boolean) => {
    forceCloseReceivedRef.current = value;
  }, []);

  // Don't return anything until provider is ready - guarantees non-null provider
  if (!setup) {
    return null;
  }

  return {
    provider: setup.provider,
    ydoc: setup.ydoc,
    status: {
      ...collaborationState,
      hasServerSynced,
      hasServerConnectionFailed,
      isEditorContentReady,
    },
    actions: {
      setForceCloseReceived,
    },
  };
};
