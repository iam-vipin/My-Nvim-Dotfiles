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

import { useEffect, useMemo, useRef, useState } from "react";
// plane imports
import type { EditorRefApi, TDisplayConfig, TMentionHandler, TRealtimeConfig } from "@plane/editor";
import { CollaborativeDocumentEditorWithRef, TrailingNode } from "@plane/editor";
import type { TWebhookConnectionQueryParams } from "@plane/types";
// components
import { EditorMentionsRoot } from "@/components";
// constants
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { callNative, generateRandomColor, getEditorFileHandlers } from "@/helpers";
// hooks
import {
  useDisableZoom,
  useEditorEmbeds,
  useEditorFlagging,
  useEditorMention,
  useMobileEditor,
  useRealtimePageEvents,
  useToolbar,
} from "@/hooks";
// store
import { usePages } from "@/hooks/store";
// types
import type { TDocumentEditorParams } from "@/types/editor";

const editorProps = {
  scrollMargin: 80,
  scrollThreshold: 80,
};

export function MobileDocumentEditor() {
  const [initialParams, setInitialParams] = useState<TDocumentEditorParams | undefined>();
  // hooks
  const {
    document: { flagged: flaggedExtensions, disabled: disabledExtensions },
  } = useEditorFlagging();

  const editorRef = useRef<EditorRefApi>(null);
  // It disables zooming in the editor.
  useDisableZoom();
  const { updatePageProperties, isEditable } = useRealtimePageEvents({
    currentPageId: initialParams?.pageId ?? "",
    currentProjectId: initialParams?.projectId,
    currentUserId: initialParams?.userId ?? "",
    editorRef,
  });
  // It keeps the native toolbar in sync with the editor state.
  const { updateActiveStates } = useToolbar(editorRef);
  const { handleEditorReady, onEditorFocus } = useMobileEditor(editorRef);
  const { fetchMentions } = useEditorMention();
  const { fetchPages: fetchSubPages } = usePages();
  const { embedHandler } = useEditorEmbeds({
    initialParams,
    isIssueEmbedEnabled: !flaggedExtensions.includes("issue-embed"),
    isNestedPagesEnabled: !flaggedExtensions.includes("nested-pages"),
  });

  const fileHandler = useMemo(() => getEditorFileHandlers(), []);

  const displayConfig: TDisplayConfig = {
    fontSize: "mobile-font",
    fontStyle: "sans-serif",
    lineSpacing: "mobile-regular",
  };

  const realtimeConfig: TRealtimeConfig | undefined = useMemo(() => {
    if (!initialParams) return undefined;
    // Construct the WebSocket Collaboration URL
    try {
      const LIVE_SERVER_BASE_URL = initialParams?.liveServerUrl.trim();
      const WS_LIVE_URL = new URL(LIVE_SERVER_BASE_URL);
      const isSecureEnvironment = initialParams?.liveServerUrl.startsWith("https");
      WS_LIVE_URL.protocol = isSecureEnvironment ? "wss" : "ws";
      WS_LIVE_URL.pathname = `${initialParams?.liveServerBasePath}/collaboration`;

      // Construct realtime config
      return {
        url: WS_LIVE_URL.toString(),
        queryParams: {
          workspaceSlug: initialParams.workspaceSlug.toString(),
          documentType: initialParams.documentType.toString() as TWebhookConnectionQueryParams["documentType"],
          projectId: initialParams.projectId ?? "",
          parentPageId: initialParams.parentPageId ?? undefined,
        },
      };
    } catch (error) {
      console.error("Error creating realtime config", error);
      return undefined;
    }
  }, [initialParams]);

  // Additional extensions for the editor.
  const externalExtensions = useMemo(() => [TrailingNode], []);

  const mentionHandler: TMentionHandler = useMemo(
    () => ({
      searchCallback: async (query) => {
        const res = await fetchMentions(query);
        if (!res) throw new Error("Failed in fetching mentions");
        return res;
      },
      renderComponent: (props) =>
        initialParams && <EditorMentionsRoot {...props} currentUserId={initialParams.userId} />,
    }),
    [fetchMentions, initialParams]
  );

  const userConfig = useMemo(
    () => ({
      id: initialParams?.userId ?? "",
      cookie: initialParams?.cookie,
      name: initialParams?.userDisplayName ?? "",
      color: generateRandomColor(initialParams?.userId ?? ""),
    }),
    [initialParams?.userId, initialParams?.cookie, initialParams?.userDisplayName]
  );

  useEffect(() => {
    try {
      callNative(CallbackHandlerStrings.getInitialDocumentEditorParams).then((params: TDocumentEditorParams) => {
        setInitialParams(params);
        if (params?.pageId) fetchSubPages(params.pageId);
      });
    } catch (error) {
      console.error("Error getting initial document editor params", error);
    }
    // It should only run once, to fetch the initial params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!realtimeConfig || !initialParams || !disabledExtensions) return null;

  return (
    <div className="min-h-screen">
      <CollaborativeDocumentEditorWithRef
        autofocus={false}
        bubbleMenuEnabled={false}
        containerClassName="min-h-screen p-0 !pb-32"
        disabledExtensions={disabledExtensions}
        displayConfig={displayConfig}
        editable={isEditable ?? initialParams?.editable ?? false}
        editorClassName="!px-5"
        editorProps={editorProps}
        extensions={externalExtensions}
        extendedEditorProps={{
          isSmoothCursorEnabled: false,
          extensionOptions: {
            attachmentComponent: {
              onClick: (source) => callNative(CallbackHandlerStrings.onAttachmentBlockClick, source),
            },
          },
          embedHandler,
        }}
        extendedDocumentEditorProps={{
          isSelfHosted: initialParams?.isSelfHosted ?? false,
          onTitleFocus: () => callNative(CallbackHandlerStrings.onPageTitleTap),
          titleContainerClassName: "px-4",
        }}
        fileHandler={fileHandler}
        flaggedExtensions={flaggedExtensions}
        handleEditorReady={handleEditorReady}
        id={initialParams?.pageId}
        dragDropEnabled={false}
        isTouchDevice
        documentLoaderClassName="px-4"
        mentionHandler={mentionHandler}
        onEditorFocus={() => {
          const resolvedIsEditable = isEditable ?? initialParams?.editable ?? false;
          if (!resolvedIsEditable) return;
          onEditorFocus();
        }}
        onTransaction={() => updateActiveStates()}
        placeholder={"Write something..."}
        realtimeConfig={realtimeConfig}
        ref={editorRef}
        updatePageProperties={updatePageProperties}
        user={userConfig}
      />
    </div>
  );
}
