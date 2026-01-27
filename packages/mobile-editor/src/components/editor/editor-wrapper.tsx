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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EditorRefApi, TDisplayConfig, TMentionHandler } from "@plane/editor";
import { LiteTextEditorWithRef, RichTextEditorWithRef, TrailingNode } from "@plane/editor";
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { callNative } from "@/helpers";
import { getEditorFileHandlers } from "@/helpers/editor-file-asset.helper";
// hooks
import {
  useDisableZoom,
  useToolbar,
  useMobileEditor,
  useEditorMention,
  useEditorFlagging,
  useInitialContentLoad,
} from "@/hooks";
// types
import type { TEditorParams } from "@/types/editor";
import { TEditorVariant } from "@/types/editor";
// local imports
import { EditorMentionsRoot } from "../mentions/mention-root";

export function EditorWrapper({ variant }: { variant: TEditorVariant }) {
  const editorRef = useRef<EditorRefApi>(null);
  const [initialParams, setInitialParams] = useState<TEditorParams | undefined>();
  // It is a custom hook that disables zooming in the editor.
  useDisableZoom();
  // It keeps the native toolbar in sync with the editor state.
  const { updateActiveStates } = useToolbar(editorRef);
  const { handleEditorReady, onEditorFocus } = useMobileEditor(editorRef);
  const { fetchMentions } = useEditorMention();
  const {
    richText: { disabled: richTextDisabledExtensions },
    liteText: { disabled: liteTextDisabledExtensions },
  } = useEditorFlagging();
  const { onInitialContentLoad } = useInitialContentLoad();
  const fileHandler = useMemo(() => getEditorFileHandlers(), []);

  // This is called by the native code to reset the initial params of the editor.
  const resetInitialParams = useCallback((params: TEditorParams) => {
    setInitialParams(params);
  }, []);

  // This is called when the editor is ready to get the initial params from the native code.
  useEffect(() => {
    callNative(CallbackHandlerStrings.getInitialEditorParams).then((params: TEditorParams) => setInitialParams(params));
  }, []);

  // Additional extensions for the editor.
  const externalExtensions = useMemo(() => [TrailingNode], []);

  window.resetInitialParams = resetInitialParams;

  const mentionHandler: TMentionHandler = useMemo(
    () =>
      variant !== TEditorVariant.sticky
        ? {
            searchCallback: async (query) => {
              const res = await fetchMentions(query);
              if (!res) throw new Error("Failed in fetching mentions");
              return res;
            },
            renderComponent: (props) =>
              initialParams && <EditorMentionsRoot currentUserId={initialParams.currentUserId} {...props} />,
          }
        : ({} as TMentionHandler),
    [fetchMentions, initialParams, variant]
  );

  const displayConfig: TDisplayConfig = {
    lineSpacing: "mobile-regular",
    fontSize: "mobile-font",
  };

  const isDependencyReady = !useMemo(() => !initialParams, [initialParams]);

  if (!isDependencyReady) return null;

  return (
    <div
      className="scrollbar-hidden"
      onClick={() => {
        callNative(CallbackHandlerStrings.onEditorClick);
        const resolvedEditable = initialParams?.editable ?? false;
        if (!resolvedEditable) return;
        onEditorFocus();
      }}
    >
      {(variant === TEditorVariant.lite || variant === TEditorVariant.sticky) && (
        <LiteTextEditorWithRef
          autofocus
          containerClassName="min-h-screen p-0 border-none !px-5"
          disabledExtensions={liteTextDisabledExtensions}
          displayConfig={displayConfig}
          editable
          editorClassName="pb-32"
          extensions={externalExtensions}
          extendedEditorProps={{
            isSmoothCursorEnabled: false,
          }}
          fileHandler={fileHandler}
          flaggedExtensions={[]}
          handleEditorReady={handleEditorReady}
          id="lite-editor"
          initialValue={initialParams?.content ?? "<p></p>"}
          isTouchDevice
          mentionHandler={mentionHandler}
          onChange={(_, html) => callNative(CallbackHandlerStrings.onContentChange, html)}
          onTransaction={updateActiveStates}
          placeholder={initialParams?.placeholder}
          ref={editorRef}
        />
      )}
      {variant === TEditorVariant.rich && (
        <RichTextEditorWithRef
          autofocus={initialParams?.autoFocus ?? false}
          bubbleMenuEnabled={false}
          containerClassName="min-h-screen p-0 border-none !px-5"
          disabledExtensions={richTextDisabledExtensions}
          displayConfig={displayConfig}
          dragDropEnabled={false}
          editable={initialParams?.editable ?? false}
          editorClassName="pb-32"
          extensions={externalExtensions}
          extendedEditorProps={{
            isSmoothCursorEnabled: false,
          }}
          fileHandler={fileHandler}
          flaggedExtensions={[]}
          handleEditorReady={handleEditorReady}
          id="rich-editor"
          initialValue={initialParams?.content ?? "<p></p>"}
          isTouchDevice
          mentionHandler={mentionHandler}
          onChange={(_, html) => callNative(CallbackHandlerStrings.onContentChange, html)}
          onTransaction={() => {
            updateActiveStates();
            onInitialContentLoad();
          }}
          placeholder={initialParams?.placeholder}
          ref={editorRef}
        />
      )}
    </div>
  );
}
