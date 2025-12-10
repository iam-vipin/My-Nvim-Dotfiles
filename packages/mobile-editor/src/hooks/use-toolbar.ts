import { useCallback } from "react";
// plane imports
import type { EditorRefApi } from "@plane/editor";
// constants
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
import { TOOLBAR_ITEMS } from "@/constants/editor";
// helpers
import { callNative } from "@/helpers/flutter-callback.helper";

export const useToolbar = (editorRef: React.MutableRefObject<EditorRefApi | null>) => {
  // Notifies the native code to with active toolbar state.
  const updateActiveStates = useCallback(() => {
    if (!editorRef.current) return;

    const newActiveStates: Record<string, boolean> = {};
    Object.values(TOOLBAR_ITEMS)
      .flat()
      .forEach((item) => {
        newActiveStates[item.key] =
          // @ts-expect-error type mismatch here
          editorRef.current?.isMenuItemActive({
            itemKey: item.key,
          }) ?? false;
      });
    callNative(CallbackHandlerStrings.getActiveToolbarState, JSON.stringify(newActiveStates));
  }, [editorRef]);

  return {
    updateActiveStates,
  };
};
