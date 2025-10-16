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

  // Sync states for loading management
  const [isContentInIndexedDb, setIsContentInIndexedDb] = useState(false);
  const [hasServerSynced, setHasServerSynced] = useState(false);
  const [hasServerConnectionFailed, setHasServerConnectionFailed] = useState(false);
  const [isIndexedDbSynced, setIsIndexedDbSynced] = useState(false);
  const [isEditorContentReady, setIsEditorContentReady] = useState(false);

  // Connection tracking (ref avoids closure issues in provider callbacks)
  const connectionRef = useRef({
    connectionAttempts: 0,
    isPermanentlyStopped: false,
    forceCloseReceived: false,
  });

  // Constants
  const maxConnectionAttempts = 3;

  // Create navigation handlers
  const { mainNavigationExtension, titleNavigationExtension, setMainEditor, setTitleEditor } = useEditorNavigation();

  // Reset force close state when document ID changes
  useEffect(() => {
    connectionRef.current.forceCloseReceived = false;
  }, [id]);

  // Initialize Hocuspocus provider for real-time collaboration
  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        name: id,
        // using user id as a token to verify the user on the server
        token: JSON.stringify(user),
        url: realtimeConfig.url,
        // NOTE: maxAttempts config is broken in Hocuspocus (see GitHub issue #762)
        // We handle retry limiting manually in the onClose handler below
        onAuthenticationFailed: () => {
          serverHandler?.onServerError?.();
          setHasServerConnectionFailed(true);
        },
        onConnect: () => {
          // If we've permanently stopped, reject this connection (zombie reconnection from Hocuspocus)
          if (connectionRef.current.isPermanentlyStopped) {
            provider?.disconnect();
            return;
          }

          // Reset retry counter on successful connection
          connectionRef.current.connectionAttempts = 0;
        },
        onStatus: (status) => {
          if (status.status === "disconnected") {
            serverHandler?.onServerError?.();
            setHasServerConnectionFailed(true);
          }
        },
        onSynced: () => {
          // Reset retry counter on successful sync (stable connection)
          connectionRef.current.connectionAttempts = 0;
          serverHandler?.onServerSynced?.();
          const workspaceSlug = new URLSearchParams(realtimeConfig.url).get("workspaceSlug");
          const projectId = new URLSearchParams(realtimeConfig.url).get("projectId");
          provider.sendStateless(
            JSON.stringify({
              action: "synced",
              workspaceSlug: workspaceSlug,
              projectId: projectId,
            })
          );
          setHasServerSynced(true);
        },
      }),
    [id, realtimeConfig.url, serverHandler, user]
  );

  // Initialize local persistence using IndexedDB
  const localProvider = useMemo(
    () => (id ? new IndexeddbPersistence(id, provider.document) : undefined),
    [id, provider]
  );

  // Helper function to permanently stop the provider and prevent all reconnection attempts
  const permanentlyStopProvider = useCallback(() => {
    const wsProvider = provider.configuration?.websocketProvider;

    // Set flag FIRST to prevent any close event handlers from running
    connectionRef.current.isPermanentlyStopped = true;

    // Disable reconnection in WebSocket provider
    if (wsProvider) {
      wsProvider.shouldConnect = false;
    }

    // Destroy the provider completely (kills all internal timers and listeners)
    try {
      provider.destroy();
    } catch (error) {
      console.error(`   ✗ Error destroying provider:`, error);
    }
  }, [provider]);

  // Handle connection close events - check close code to determine behavior
  useEffect(() => {
    const handleClose = (event: { event?: { code?: number; reason?: string } }) => {
      const closeCode = event.event?.code;
      const conn = connectionRef.current;

      // CRITICAL: If we've already permanently stopped, ignore ALL close events
      if (conn.isPermanentlyStopped) {
        return;
      }

      // Forced close can be detected in two ways:
      // 1. Close code 4000-4003 (if transmitted correctly by WebSocket)
      // 2. force_close message received before close event (backup method)
      const isForcedClose = isForcedCloseCode(closeCode) || conn.forceCloseReceived;

      if (isForcedClose) {
        // Trigger fallback mechanism (show error UI to user)
        serverHandler?.onServerError?.();
        setHasServerConnectionFailed(true);

        // Permanently stop the provider (destroys all timers)
        permanentlyStopProvider();

        // Reset values
        conn.connectionAttempts = 0;
        conn.forceCloseReceived = false;
      } else {
        // Increment connection attempts counter
        conn.connectionAttempts++;

        // Always trigger fallback
        serverHandler?.onServerError?.();
        setHasServerConnectionFailed(true);

        // Stop after max attempts
        if (conn.connectionAttempts >= maxConnectionAttempts) {
          // Permanently stop the provider (destroys all timers and prevents zombie reconnections)
          permanentlyStopProvider();
        }
      }
    };

    provider?.on("close", handleClose);

    return () => {
      provider?.off("close", handleClose);
    };
  }, [provider, serverHandler, id, maxConnectionAttempts, permanentlyStopProvider]);

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

  // Clear IndexedDB if document is truly empty after both server and IndexedDB have synced
  useEffect(() => {
    if (!isIndexedDbSynced || !hasServerSynced || !localProvider) return;
    const docLength = localProvider.doc.share.get("default")?._length;

    if (docLength === 0 || docLength === undefined) {
      setIsContentInIndexedDb(false);
      clearIndexedDbForPage(id);
    }
  }, [isIndexedDbSynced, hasServerSynced, localProvider, id]);

  // Mark editor content as ready when sync process completes
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

  // Clean up providers on unmount
  useEffect(
    () => () => {
      // CRITICAL: Set permanently stopped flag BEFORE destroying
      // This prevents the onClose handler from processing the unmount close event
      connectionRef.current.isPermanentlyStopped = true;

      provider?.destroy();
      localProvider?.destroy();
    },
    [provider, localProvider]
  );

  // Initialize main document editor
  const editor = useEditor({
    disabledExtensions,
    extendedEditorProps,
    id,
    editable,
    editorProps,
    editorClassName,
    enableHistory: false,
    extensions: [
      // Core extensions
      SideMenuExtension({
        aiEnabled: !disabledExtensions?.includes("ai"),
        dragDropEnabled,
      }),
      HeadingListExtension,
      // Collaboration extension
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
      // Navigation extension for keyboard shortcuts
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

  // Create setter function for realtime events hook
  const setForceCloseReceived = useCallback((value: boolean) => {
    connectionRef.current.forceCloseReceived = value;
  }, []);

  // Use the new hook for realtime events
  useRealtimeEvents({
    editor,
    provider,
    id,
    updatePageProperties,
    setForceCloseReceived,
  });

  // Initialize title editor
  const titleEditor = useTitleEditor({
    id,
    editable,
    provider,
    titleRef,
    updatePageProperties,
    extensions: [
      // Collaboration extension for title field
      Collaboration.configure({
        document: provider.document,
        field: "title",
      }),

      // Navigation extension for keyboard shortcuts
      titleNavigationExtension,
    ],
    extendedEditorProps,
  });

  // Connect editors for navigation once they're initialized
  useEffect(() => {
    if (editor && titleEditor) {
      setMainEditor(editor);
      setTitleEditor(titleEditor);
    }
  }, [editor, titleEditor, setMainEditor, setTitleEditor]);

  return {
    editor,
    titleEditor,
    hasServerSynced,
    hasServerConnectionFailed,
    isContentInIndexedDb,
    isIndexedDbSynced,
    isEditorContentReady,
  };
};
