import { useCallback, useState } from "react";
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
import { callNative } from "@/helpers/flutter-callback.helper";

export const useInitialContentLoad = () => {
  const [isInitialContentLoaded, setIsInitialContentLoaded] = useState<boolean>(false);
  // Verifies editor initialization with initial content and triggers a callback with the content height
  const onInitialContentLoad = useCallback(() => {
    const editorContainer = document.querySelector(".tiptap");
    if (
      editorContainer &&
      '<p class="editor-paragraph-block"></p>' !== editorContainer.innerHTML &&
      !isInitialContentLoaded
    ) {
      setIsInitialContentLoaded(true);
      callNative(CallbackHandlerStrings.onInitialContentLoad, editorContainer.clientHeight.toString());
    }
  }, [isInitialContentLoaded]);

  return { onInitialContentLoad };
};
