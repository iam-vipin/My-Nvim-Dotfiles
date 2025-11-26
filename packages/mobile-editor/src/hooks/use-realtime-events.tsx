import { MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";
// types
import type { EditorRefApi, EventToPayloadMap, TDocumentEventEmitter, TDocumentEventsClient } from "@plane/editor";
// constants
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { callNative } from "@/helpers";
// store
import { usePages } from "@/hooks/store";

// Type for page update handlers with proper typing for action data
export type PageUpdateHandler<T extends keyof EventToPayloadMap = keyof EventToPayloadMap> = (params: {
  pageIds: string[];
  data: EventToPayloadMap[T];
  performAction: boolean;
}) => void;

// Type for custom event handlers that can be provided to override default behavior
export type TCustomEventHandlers = {
  [K in keyof EventToPayloadMap]?: PageUpdateHandler<K>;
};

interface UsePageEventsProps {
  currentPageId: string;
  currentProjectId?: string;
  currentUserId: string;
  editorRef: MutableRefObject<EditorRefApi | null>;
  customRealtimeEventHandlers?: TCustomEventHandlers;
}

export const useRealtimePageEvents = ({
  currentPageId,
  currentProjectId,
  currentUserId,
  editorRef,
}: UsePageEventsProps) => {
  const [isEditable, setIsEditable] = useState<boolean | null>(null);

  // CurrentUserAction local state to track if the current action is being processed
  // A local action is basically the action performed by the current user to avoid double operations
  const [currentActionBeingProcessed, setCurrentActionBeingProcessed] = useState<TDocumentEventsClient | null>(null);
  const [refInitialized, setRefInitialized] = useState(false);
  const { getSubPageById } = usePages();

  const customRealtimeEventHandlers: TCustomEventHandlers = useMemo(
    () =>
      currentProjectId
        ? {
            moved: async ({ pageIds, data }) => {
              if (data.new_project_id && data.new_page_id) {
                // For project pages, handle the move to a different project
                // Call the actual movePage implementation
                if (pageIds.includes(currentPageId)) {
                  callNative(
                    CallbackHandlerStrings.getCollaborativeDocumentEvents,
                    JSON.stringify({
                      event: "moved",
                      payload: data,
                    })
                  );
                }
              }
            },
          }
        : {},
    [currentPageId, currentProjectId]
  );

  const updatePageAccess = useCallback(
    async (pageId: string) => {
      const response = await callNative(CallbackHandlerStrings.getPageAccess);
      const access = JSON.parse(response);
      const canEdit = access["canEdit"] === true;
      const canView = access["canView"] === true;
      const pageItem = getSubPageById(pageId);
      if (pageItem) {
        pageItem.setCanEdit(canEdit);
        pageItem.setCanView(canView);
      }
      setIsEditable(canEdit);
    },
    [getSubPageById]
  );

  const ACTION_HANDLERS = useMemo<
    Partial<{
      [K in keyof EventToPayloadMap]: PageUpdateHandler<K>;
    }>
  >(
    () => ({
      archived: ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          const pageItem = getSubPageById(pageId);
          if (pageItem) pageItem.archive();
          if (currentPageId === pageId) {
            callNative(
              CallbackHandlerStrings.getCollaborativeDocumentEvents,
              JSON.stringify({
                event: "archived",
                payload: data,
              })
            );
            updatePageAccess(pageId);
            setIsEditable(false);
          }
        });
      },
      unarchived: ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          const pageItem = getSubPageById(pageId);
          if (pageItem) pageItem.restore();

          if (currentPageId === pageId) {
            callNative(
              CallbackHandlerStrings.getCollaborativeDocumentEvents,
              JSON.stringify({
                event: "unarchived",
                payload: data,
              })
            );
            updatePageAccess(pageId);
          }
        });
      },
      locked: ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          const pageItem = getSubPageById(pageId);
          if (pageItem) pageItem.lock();
          if (currentPageId === pageId) {
            setIsEditable(false);
            callNative(
              CallbackHandlerStrings.getCollaborativeDocumentEvents,
              JSON.stringify({
                event: "locked",
                payload: data,
              })
            );
            updatePageAccess(pageId);
            setIsEditable(false);
          }
        });
      },
      unlocked: ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          const pageItem = getSubPageById(pageId);
          if (pageItem) pageItem.unlock();
          if (currentPageId === pageId) {
            callNative(
              CallbackHandlerStrings.getCollaborativeDocumentEvents,
              JSON.stringify({
                event: "unlocked",
                payload: data,
              })
            );
            updatePageAccess(pageId);
          }
        });
      },
      "made-public": ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          const pageItem = getSubPageById(pageId);
          if (pageItem) pageItem.makePublic();
          if (currentPageId === pageId) {
            callNative(
              CallbackHandlerStrings.getCollaborativeDocumentEvents,
              JSON.stringify({
                event: "made-public",
                payload: data,
              })
            );
            updatePageAccess(pageId);
          }
        });
      },
      "made-private": ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          const pageItem = getSubPageById(pageId);
          if (pageItem) pageItem.makePrivate();
          if (currentPageId === pageId) {
            callNative(
              CallbackHandlerStrings.getCollaborativeDocumentEvents,
              JSON.stringify({
                event: "made-private",
                payload: data,
              })
            );
            updatePageAccess(pageId);
          }
        });
      },
      deleted: ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          if (currentPageId === pageId) {
            callNative(
              CallbackHandlerStrings.getCollaborativeDocumentEvents,
              JSON.stringify({
                event: "deleted",
                payload: data,
              })
            );
          }
        });
      },
      property_updated: ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          const pageInstance = getSubPageById(pageId);
          const { name: updatedName, ...rest } = data;
          if (updatedName != null) {
            pageInstance?.updateTitle(updatedName);
            if (pageId === currentPageId) {
              callNative(
                CallbackHandlerStrings.updatePageTitle,
                JSON.stringify({
                  pageId: pageId,
                  name: updatedName,
                })
              );
            }
          }
          pageInstance?.mutateProperties(rest);
        });
      },
      moved_internally: ({ pageIds, data }) => {
        pageIds.forEach((pageId) => {
          if (data.parent_id !== undefined) {
            if (pageId === currentPageId) {
              callNative(
                CallbackHandlerStrings.getCollaborativeDocumentEvents,
                JSON.stringify({
                  event: "moved_internally",
                  payload: data,
                })
              );
            }
          }
        });
      },
      shared: async ({ data }) => {
        const { users_and_access } = data;
        for (const user of users_and_access) {
          const { user_id, access, page_id: pageIds } = user;
          for (const pageId of pageIds) {
            if (currentUserId === user_id && pageId === currentPageId) {
              callNative(
                CallbackHandlerStrings.getCollaborativeDocumentEvents,
                JSON.stringify({
                  event: "shared",
                  payload: {
                    access,
                  },
                })
              );
              updatePageAccess(pageId);
            }
          }
        }
      },
      unshared: async ({ data }) => {
        const { users_and_access } = data;
        for (const user of users_and_access) {
          const { user_id, access, page_id: pageIds } = user;
          for (const pageId of pageIds) {
            if (pageId === currentPageId && currentUserId === user_id) {
              setIsEditable(false);
              callNative(
                CallbackHandlerStrings.getCollaborativeDocumentEvents,
                JSON.stringify({
                  event: "unshared",
                  payload: {
                    access,
                  },
                })
              );
            }
          }
        }
      },
      published: () => {},
      unpublished: () => {},
      "collaborators-updated": () => {},
      restored: () => {},
      duplicated: () => {},
      ...customRealtimeEventHandlers,
    }),
    [getSubPageById, currentPageId, currentUserId, customRealtimeEventHandlers, updatePageAccess]
  );

  // The main function that will be returned from this hook
  const updatePageProperties = useCallback(
    <T extends keyof EventToPayloadMap>(
      pageIds: string | string[],
      actionType: T,
      data: EventToPayloadMap[T],
      performAction = false
    ) => {
      // Convert to array if single string is passed
      const normalizedPageIds = Array.isArray(pageIds) ? pageIds : [pageIds];

      if (normalizedPageIds.length === 0) return;

      // Get the handler for this message type
      const handler = ACTION_HANDLERS[actionType];

      if (handler) {
        // Now TypeScript knows that handler and data match in type
        handler({ pageIds: normalizedPageIds, data, performAction });
      } else {
        console.warn(`No handler for message type: ${actionType}`);
      }
    },
    [ACTION_HANDLERS]
  );

  useEffect(() => {
    let realTimeStatelessMessageListener: TDocumentEventEmitter | undefined;
    const handleStatelessMessage = (message: { payload: TDocumentEventsClient }) => {
      if (currentActionBeingProcessed === message.payload) {
        setCurrentActionBeingProcessed(null);
        return;
      }

      if (message.payload) {
        if (message.payload === "locked" || message.payload === "archived") {
          setIsEditable(false);
        }
      }
    };
    setInterval(() => {
      if (editorRef.current && !refInitialized) {
        setRefInitialized(true);
        realTimeStatelessMessageListener = editorRef?.current?.listenToRealTimeUpdate();
        realTimeStatelessMessageListener?.on("stateless", handleStatelessMessage);
      }
    }, 500);

    return () => {
      realTimeStatelessMessageListener?.off("stateless", handleStatelessMessage);
    };
  }, [editorRef, currentActionBeingProcessed, currentPageId, refInitialized, currentUserId, getSubPageById]);

  return { isEditable, updatePageProperties };
};
