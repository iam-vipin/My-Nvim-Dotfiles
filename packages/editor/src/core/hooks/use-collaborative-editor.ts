import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
// react
import { useEffect, useMemo, useState } from "react";
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

  // Create navigation handlers
  const { mainNavigationExtension, titleNavigationExtension, setMainEditor, setTitleEditor } = useEditorNavigation();

  // Initialize Hocuspocus provider for real-time collaboration
  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        name: id,
        // using user id as a token to verify the user on the server
        token: JSON.stringify(user),
        url: realtimeConfig.url,
        onAuthenticationFailed: () => {
          serverHandler?.onServerError?.();
          setHasServerConnectionFailed(true);
        },
        onConnect: () => serverHandler?.onConnect?.(),
        onStatus: (status) => {
          if (status.status === "disconnected") {
            serverHandler?.onServerError?.();
            setHasServerConnectionFailed(true);
          }
        },
        onClose: (data) => {
          if (data.event.code === 1006) {
            serverHandler?.onServerError?.();
            setHasServerConnectionFailed(true);
          }
        },
        onSynced: () => {
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

  // Handle IndexedDB sync and check for content availability
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

  // Use the new hook for realtime events
  useRealtimeEvents({
    editor,
    provider,
    id,
    updatePageProperties,
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
