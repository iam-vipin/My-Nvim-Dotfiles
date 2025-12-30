import { TEditorCommands } from "@plane/editor";
import { TEditorParams, TMentionSuggestionResponse } from "@/types";

declare global {
  interface Window {
    // app.tsx
    setEditorVariant: (variant: string) => void;
    flutter_inappwebview: {
      callHandler(method: string, args?: string): Promise<any>;
    } | null;
    // use-editor-wrapper.ts
    resetInitialParams: (params: TEditorParams) => void;
    // use-mobile-editor.ts
    sendContent: () => string | undefined;
    executeAction: (actionKey: TEditorCommands) => void;
    undo: () => void;
    redo: () => void;
    unfocus: () => void;
    focus: () => void;
    scrollToFocus: (scrollPos: number) => void;
    setLink: (link: string, text?: string) => void | undefined;
    getSelectedNodeLink: () => string | undefined;
    getSelectedText: () => string | null | undefined;
    createSelectionAtCursorPosition: () => void;
    setEditorValue: (content: string) => void;
    // use-editor-mention.ts
    getMembers: () => Promise<TMentionSuggestionResponse[]>;
    setMembers: (members: TMentionSuggestionResponse[]) => void;
    getUserId: () => void;
  }
}
