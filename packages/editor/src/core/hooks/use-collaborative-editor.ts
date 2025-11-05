import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
// react
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// indexeddb
import { IndexeddbPersistence } from "y-indexeddb";
// extensions
import { HeadingListExtension, SideMenuExtension } from "@/extensions";
// hooks
import { useEditor } from "@/hooks/use-editor";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
// plane editor extensions
import { DocumentEditorAdditionalExtensions } from "@/plane-editor/extensions";
// types
import { TCollaborativeEditorHookProps } from "@/types";
import type { CollaborationState, ConnectionStatus, SyncStatus } from "@/types/collaboration";
// local imports
import { useEditorNavigation } from "./use-editor-navigation";
import { useTitleEditor } from "./use-title-editor";

// Helper to check if a close code indicates a forced close
const isForcedCloseCode = (code: number | undefined): boolean => {
  if (!code) return false;
  // All custom close codes (4000-4003) are treated as forced closes
  return code >= 4000 && code <= 4003;
};

// Clears IndexedDB for a page when the document is confirmed to be empty from the server
const clearIndexedDbForPage = async (pageId: string) => {
  try {
    indexedDB.deleteDatabase(pageId);
  } catch (error) {
    console.error(` Error clearing IndexedDB for page ${pageId}:`, error);
  }
};

export const useCollaborativeEditor = (props: TCollaborativeEditorHookProps) => {
  const {
    onAssetChange,
    onChange,
    onTransaction,
    disabledExtensions,
    editable,
    editorClassName = "",
    editorProps = {},
    extendedEditorProps,
    extensions = [],
    fileHandler,
    flaggedExtensions,
    forwardedRef,
    handleEditorReady,
    id,
    mentionHandler,
    dragDropEnabled = true,
    isTouchDevice,
    onEditorFocus,
    placeholder,
    realtimeConfig,
    serverHandler,
    tabIndex,
    titleRef,
    updatePageProperties,
    user,
  } = props;

  // State machine for collaboration status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("initial");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const [collaborationError, setCollaborationError] = useState<CollaborationState["error"]>();

  // Sync states for loading management
  const [isContentInIndexedDb, setIsContentInIndexedDb] = useState(false);
  const [isIndexedDbSynced, setIsIndexedDbSynced] = useState(false);
  const [isEditorContentReady, setIsEditorContentReady] = useState(false);

  // Derived values for backward compatibility
  const hasServerSynced = syncStatus === "synced";
  const hasServerConnectionFailed = connectionStatus === "disconnected";

  // Connection tracking (ref avoids closure issues in provider callbacks)
  const connectionRef = useRef({
    connectionAttempts: 0,
    isPermanentlyStopped: false,
    forceCloseReceived: false,
  });

  const maxConnectionAttempts = 3;
  const { mainNavigationExtension, titleNavigationExtension, setMainEditor, setTitleEditor } = useEditorNavigation();

  useEffect(() => {
    setConnectionStatus("initial");
    setSyncStatus("syncing");
    setCollaborationError(undefined);
    setIsContentInIndexedDb(false);
    setIsIndexedDbSynced(false);
    setIsEditorContentReady(false);
    connectionRef.current.connectionAttempts = 0;
    connectionRef.current.forceCloseReceived = false;
    connectionRef.current.isPermanentlyStopped = false;
  }, [id]);

  useEffect(() => {
    const state: CollaborationState = {
      connectionStatus,
      syncStatus,
      error: collaborationError,
    };

    serverHandler.onStateChange(state);
  }, [connectionStatus, syncStatus, collaborationError, serverHandler]);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        name: id,
        token: JSON.stringify(user),
        url: realtimeConfig.url,
        onAuthenticationFailed: () => {
          setConnectionStatus("disconnected");
          setCollaborationError({ type: "auth-failed", message: "Authentication failed" });
        },
        onConnect: () => {
          if (connectionRef.current.isPermanentlyStopped) {
            provider?.disconnect();
            return;
          }

          connectionRef.current.connectionAttempts = 0;
          setConnectionStatus("connected");
          setCollaborationError(undefined);
        },
        onStatus: (status) => {
          if (status.status === "connecting") {
            const isReconnecting = connectionRef.current.connectionAttempts > 0;
            setConnectionStatus(isReconnecting ? "reconnecting" : "connecting");
            setSyncStatus("syncing"); // Reset sync status during connection attempts
          } else if (status.status === "disconnected") {
            setConnectionStatus("disconnected");
            setSyncStatus("syncing"); // Reset sync status when disconnected
            setCollaborationError({ type: "network-error", message: "Connection lost" });
          } else if (status.status === "connected") {
            setConnectionStatus("connected");
            setCollaborationError(undefined);
          }
        },
        onSynced: () => {
          connectionRef.current.connectionAttempts = 0;
          setConnectionStatus("connected"); // Defensive: synced implies connected
          setSyncStatus("synced");
          setCollaborationError(undefined);

          const workspaceSlug = new URLSearchParams(realtimeConfig.url).get("workspaceSlug");
          const projectId = new URLSearchParams(realtimeConfig.url).get("projectId");
          provider.sendStateless(
            JSON.stringify({
              action: "synced",
              workspaceSlug: workspaceSlug,
              projectId: projectId,
            })
          );
        },
      }),
    [id, realtimeConfig.url, user]
  );

  const localProvider = useMemo(
    () => (id ? new IndexeddbPersistence(id, provider.document) : undefined),
    [id, provider]
  );

  const permanentlyStopProvider = useCallback(() => {
    const wsProvider = provider.configuration?.websocketProvider;
    connectionRef.current.isPermanentlyStopped = true;

    if (wsProvider) {
      wsProvider.shouldConnect = false;
    }

    try {
      provider.destroy();
    } catch (error) {
      console.error(`Error destroying provider:`, error);
    }
  }, [provider]);

  useEffect(() => {
    const handleClose = (event: { event?: { code?: number; reason?: string } }) => {
      const closeCode = event.event?.code;
      const conn = connectionRef.current;

      if (conn.isPermanentlyStopped) {
        return;
      }

      const isForcedClose = isForcedCloseCode(closeCode) || conn.forceCloseReceived;

      if (isForcedClose) {
        setConnectionStatus("disconnected");
        setSyncStatus("syncing"); // Reset sync status on forced close
        setCollaborationError({
          type: "forced-close",
          code: closeCode || 0,
          message: "Server forced connection close",
        });

        permanentlyStopProvider();
        conn.connectionAttempts = 0;
        conn.forceCloseReceived = false;
      } else {
        conn.connectionAttempts++;

        if (conn.connectionAttempts >= maxConnectionAttempts) {
          setConnectionStatus("disconnected");
          setSyncStatus("syncing"); // Reset sync status after max retries
          setCollaborationError({
            type: "max-retries",
            message: `Failed to connect after ${maxConnectionAttempts} attempts`,
          });

          permanentlyStopProvider();
        } else {
          setConnectionStatus("reconnecting");
          setSyncStatus("syncing"); // Reset sync status during reconnection
          setCollaborationError({ type: "network-error", message: "Connection lost, reconnecting..." });
        }
      }
    };

    provider?.on("close", handleClose);

    return () => {
      provider?.off("close", handleClose);
    };
  }, [provider, maxConnectionAttempts, permanentlyStopProvider]);

  useEffect(() => {
    if (!localProvider) return;

    const handleIndexedDbSync = () => {
      const docLength = localProvider.doc.share.get("default")?._length;

      setIsIndexedDbSynced(true);

      if (docLength && docLength > 0) {
        setIsContentInIndexedDb(true);
      } else {
        setIsContentInIndexedDb(false);
      }
    };

    localProvider.on("synced", handleIndexedDbSync);

    return () => {
      localProvider.off("synced", handleIndexedDbSync);
    };
  }, [localProvider, id]);

  useEffect(() => {
    if (!isIndexedDbSynced || !hasServerSynced || !localProvider) return;
    const docLength = localProvider.doc.share.get("default")?._length;

    if (docLength === 0 || docLength === undefined) {
      setIsContentInIndexedDb(false);
      clearIndexedDbForPage(id);
    } else {
      setIsContentInIndexedDb(true);
    }
  }, [isIndexedDbSynced, hasServerSynced, localProvider, id]);

  useEffect(() => {
    if (!isIndexedDbSynced) {
      return;
    }

    if (isContentInIndexedDb) {
      setIsEditorContentReady(true);
      return;
    }

    if (hasServerSynced || hasServerConnectionFailed) {
      setIsEditorContentReady(true);
      return;
    }
  }, [isIndexedDbSynced, isContentInIndexedDb, hasServerSynced, hasServerConnectionFailed, id]);

  useEffect(
    () => () => {
      connectionRef.current.isPermanentlyStopped = true;
      provider?.destroy();
      localProvider?.destroy();
    },
    [provider, localProvider]
  );

  const editor = useEditor({
    disabledExtensions,
    extendedEditorProps,
    id,
    editable,
    editorProps,
    editorClassName,
    enableHistory: false,
    extensions: [
      SideMenuExtension({
        aiEnabled: !disabledExtensions?.includes("ai"),
        dragDropEnabled,
      }),
      HeadingListExtension,
      Collaboration.configure({
        document: provider.document,
        field: "default",
      }),
      ...extensions,
      ...DocumentEditorAdditionalExtensions({
        disabledExtensions,
        extendedEditorProps,
        fileHandler,
        flaggedExtensions,
        isEditable: editable,
        provider,
        userDetails: user,
      }),
      mainNavigationExtension,
    ],
    fileHandler,
    flaggedExtensions,
    forwardedRef,
    handleEditorReady,
    isTouchDevice,
    mentionHandler,
    onAssetChange,
    onChange,
    onEditorFocus,
    onTransaction,
    placeholder,
    provider,
    tabIndex,
  });

  const setForceCloseReceived = useCallback((value: boolean) => {
    connectionRef.current.forceCloseReceived = value;
  }, []);

  useRealtimeEvents({
    editor,
    provider,
    id,
    updatePageProperties,
    setForceCloseReceived,
  });

  const titleEditor = useTitleEditor({
    id,
    editable,
    provider,
    titleRef,
    updatePageProperties,
    extensions: [
      Collaboration.configure({
        document: provider.document,
        field: "title",
      }),
      titleNavigationExtension,
    ],
    extendedEditorProps,
  });

  useEffect(() => {
    if (editor && titleEditor) {
      setMainEditor(editor);
      setTitleEditor(titleEditor);
    }
  }, [editor, titleEditor, setMainEditor, setTitleEditor]);

  return {
    editor,
    titleEditor,
    connectionStatus,
    syncStatus,
    collaborationError,
    hasServerSynced,
    hasServerConnectionFailed,
    isContentInIndexedDb,
    isIndexedDbSynced,
    isEditorContentReady,
  };
};
