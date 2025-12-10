import type { HocuspocusProvider } from "@hocuspocus/provider";
import type { Editor } from "@tiptap/react";
import { useEffect } from "react";
// types
import type { EventToPayloadMap, ICollaborativeDocumentEditorProps, BroadcastedEventUnion } from "@/types";

export const useRealtimeEvents = (props: {
  editor: Editor | null;
  provider: HocuspocusProvider;
  id: string;
  updatePageProperties: ICollaborativeDocumentEditorProps["updatePageProperties"];
  signalForcedClose: (value: boolean) => void;
}) => {
  const { editor, updatePageProperties, provider, id, signalForcedClose } = props;

  useEffect(() => {
    if (!editor) return;

    const handleStatelessMessage = (payload: { payload: string }) => {
      try {
        // Parse the payload as our BroadcastPayloadUnion
        const event = JSON.parse(payload.payload) as BroadcastedEventUnion;

        // CRITICAL: Check for force_close message FIRST (before other event handling)
        if ((event as any).type === "force_close") {
          // Mark this as a forced close for the onClose handler
          signalForcedClose(true);

          return; // Don't process as normal event
        }

        if (!updatePageProperties) return;

        if (event.action === "moved_internally") {
          const movedPageId = event.affectedPages.currentPage;

          if (movedPageId) {
            const partialData: Partial<EventToPayloadMap["moved_internally"]> = {
              parent_id: event.data.new_parent_id,
            };
            updatePageProperties(movedPageId, event.action, partialData, true);
          }

          if (event.data.new_parent_id) {
            const parentUpdateData: Partial<EventToPayloadMap["moved_internally"]> = {
              sub_pages_count: 1,
            };
            updatePageProperties(event.data.new_parent_id, event.action, parentUpdateData, true);
          }

          if (event.data.old_parent_id) {
            const oldParentUpdateData: Partial<EventToPayloadMap["moved_internally"]> = {
              sub_pages_count: -1,
            };
            updatePageProperties(event.data.old_parent_id, event.action, oldParentUpdateData, true);
          }
          return;
        }

        if (event.action === "property_updated") {
          const currentPage = event.affectedPages.currentPage;

          if (event.data.name != null && currentPage) {
            updatePageProperties(currentPage, event.action, event.data, true);
          }
          return;
        }

        if (event.action === "error") {
          const currentPage = event.affectedPages.currentPage;
          if (currentPage) {
            updatePageProperties(currentPage, event.action, event.data, false);

            // Backend closes connection when critical error occurs
            // No need to disconnect from frontend - server handles it
          }
          return;
        }

        // For all other events, update affected pages
        const pageIdsToUpdate = [event.affectedPages.currentPage, ...(event.affectedPages.descendantPages ?? [])];

        updatePageProperties(pageIdsToUpdate, event.action, event.data, false);
      } catch (e) {
        console.log("error parsing message", e);
      }
    };

    provider?.on("stateless", handleStatelessMessage);

    return () => {
      provider?.off("stateless", handleStatelessMessage);
    };
  }, [editor, id, provider, updatePageProperties]);
};
