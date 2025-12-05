import type React from "react";
import { useCallback } from "react";
import type { EditorRefApi, TEditorCommands } from "@plane/editor";
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { callNative } from "@/helpers";

export const useMobileEditor = (editorRef: React.MutableRefObject<EditorRefApi | null>) => {
  const setEditorValue = useCallback(
    (content: string) => {
      editorRef.current?.setEditorValue(content);
    },
    [editorRef]
  );

  /**
   * @returns the current content of the editor in HTML & binary format.
   */
  const sendContent = useCallback(() => {
    const editorDocument = editorRef.current?.getDocument();
    return editorDocument?.html;
  }, [editorRef]);

  // Notifies the native code that the editor is focused.
  const onEditorFocus = useCallback(() => callNative(CallbackHandlerStrings.onEditorFocused), []);

  // Executes the action based on the action key.
  const executeAction = useCallback(
    (actionKey: TEditorCommands) => {
      // @ts-expect-error type mismatch here
      editorRef.current?.executeMenuItemCommand({
        itemKey: actionKey,
      });
      editorRef.current?.scrollToNodeViaDOMCoordinates({
        behavior: "smooth",
      });
    },
    [editorRef]
  );

  /**
   * @description Set the link of the selected node.
   * @param link - The link to be set.
   * @param text - The text to be set for the link.
   */
  const setLink = useCallback(
    (link: string, text?: string) =>
      editorRef?.current?.executeMenuItemCommand<"link">({
        itemKey: "link",
        url: link,
        text: text,
      }),
    [editorRef]
  );

  const createSelectionAtCursorPosition = useCallback(
    () => editorRef.current?.createSelectionAtCursorPosition(),
    [editorRef]
  );

  /**
   * @description Unfocus the editor.
   * @usecase This is required to remove the focus from the editor when the user taps outside the editor.
   */
  const unfocus = useCallback(() => editorRef.current?.blur(), [editorRef]);

  /**
   * @description Focus the editor.
   * @usecase This is required to focus the editor when the user taps on the editor.
   */
  const focus = useCallback(() => editorRef.current?.focus("start"), [editorRef]);

  // Scrolls to the focused node in the editor.
  const scrollToFocus = useCallback(
    (scrollPos?: number) =>
      editorRef.current?.scrollToNodeViaDOMCoordinates({
        behavior: "instant",
        pos: scrollPos,
      }),
    [editorRef]
  );

  /**
   * @description when the editor is ready, call the native code to notify that the editor is ready.
   * @param isReady - boolean
   */
  const handleEditorReady = useCallback((isReady: boolean) => {
    if (isReady) {
      callNative(CallbackHandlerStrings.onEditorReady);
    }
  }, []);

  const undo = useCallback(() => editorRef.current?.undo(), [editorRef]);

  const redo = useCallback(() => editorRef.current?.redo(), [editorRef]);

  /**
   * @description Returns the link of the selected node, if any.
   */
  const getSelectedNodeLink = useCallback(
    () => editorRef.current?.getAttributesWithExtendedMark("link", "link")?.href,
    [editorRef]
  );

  const getSelectedText = useCallback(() => editorRef.current?.getSelectedText(), [editorRef]);

  // Expose the functions to the window object.
  window.unfocus = unfocus;
  window.focus = focus;
  window.scrollToFocus = scrollToFocus;
  window.executeAction = executeAction;
  window.sendContent = sendContent;
  window.undo = undo;
  window.redo = redo;
  window.setLink = setLink;
  window.getSelectedNodeLink = getSelectedNodeLink;
  window.getSelectedText = getSelectedText;
  window.createSelectionAtCursorPosition = createSelectionAtCursorPosition;
  window.setEditorValue = setEditorValue;

  return {
    handleEditorReady,
    onEditorFocus,
    unfocus,
  };
};
