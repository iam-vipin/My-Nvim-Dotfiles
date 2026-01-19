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

import { forwardRef, useCallback } from "react";
// components
import { EditorWrapper } from "@/components/editors";
import { BlockMenu, EditorBubbleMenu } from "@/components/menus";
// extensions
import { SideMenuExtension } from "@/extensions";
// plane editor imports
import { RichTextEditorAdditionalExtensions } from "@/plane-editor/extensions/rich-text-extensions";
// types
import type { EditorRefApi, IRichTextEditorProps } from "@/types";

function RichTextEditor(props: IRichTextEditorProps) {
  const {
    bubbleMenuEnabled = true,
    disabledExtensions,
    dragDropEnabled,
    extensions: externalExtensions = [],
    fileHandler,
    flaggedExtensions,
    extendedEditorProps,
  } = props;

  const getExtensions = useCallback(() => {
    const extensions = [
      ...externalExtensions,
      SideMenuExtension({
        aiEnabled: false,
        dragDropEnabled: !!dragDropEnabled,
      }),
      ...RichTextEditorAdditionalExtensions({
        disabledExtensions,
        fileHandler,
        flaggedExtensions,
        extendedEditorProps,
      }),
    ];

    return extensions;
  }, [dragDropEnabled, disabledExtensions, externalExtensions, fileHandler, flaggedExtensions, extendedEditorProps]);

  return (
    <EditorWrapper {...props} extensions={getExtensions()}>
      {(editor) => (
        <>
          {editor && bubbleMenuEnabled && (
            <EditorBubbleMenu
              disabledExtensions={disabledExtensions}
              editor={editor}
              extendedEditorProps={extendedEditorProps}
              flaggedExtensions={flaggedExtensions}
            />
          )}
          <BlockMenu
            editor={editor}
            flaggedExtensions={flaggedExtensions}
            disabledExtensions={disabledExtensions}
            originUrl={extendedEditorProps?.originUrl}
          />
        </>
      )}
    </EditorWrapper>
  );
}

const RichTextEditorWithRef = forwardRef(function RichTextEditorWithRef(
  props: IRichTextEditorProps,
  ref: React.ForwardedRef<EditorRefApi>
) {
  return <RichTextEditor {...props} forwardedRef={ref as React.MutableRefObject<EditorRefApi | null>} />;
});

RichTextEditorWithRef.displayName = "RichTextEditorWithRef";

export { RichTextEditorWithRef };
