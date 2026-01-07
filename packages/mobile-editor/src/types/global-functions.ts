/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

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
