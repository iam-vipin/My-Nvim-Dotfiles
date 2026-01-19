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

import type { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import { useEffect, useMemo } from "react";
// extensions
import { HeadingListExtension, SideMenuExtension } from "@/extensions";
// hooks
import { useEditor } from "@/hooks/use-editor";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
// plane editor extensions
import { DocumentEditorAdditionalExtensions } from "@/plane-editor/extensions";
// types
import type { TCollaborativeEditorHookProps, TEditorHookProps } from "@/types";
// local imports
import { useEditorNavigation } from "./use-editor-navigation";
import type { TUseTitleEditorProps } from "./use-title-editor";
import { useTitleEditor } from "./use-title-editor";

type UseCollaborativeEditorArgs = Omit<TCollaborativeEditorHookProps, "realtimeConfig" | "serverHandler" | "user"> & {
  provider: HocuspocusProvider;
  user: TCollaborativeEditorHookProps["user"];
  actions: {
    signalForcedClose: (value: boolean) => void;
  };
};

export const useCollaborativeEditor = (props: UseCollaborativeEditorArgs) => {
  const {
    provider,
    onAssetChange,
    onChange,
    onTransaction,
    disabledExtensions,
    editable,
    editorClassName = "",
    editorProps = {},
    extendedEditorProps,
    extensions = [],
    fileHandler,
    flaggedExtensions,
    forwardedRef,
    getEditorMetaData,
    handleEditorReady,
    id,
    mentionHandler,
    dragDropEnabled = true,
    isTouchDevice,
    onEditorFocus,
    placeholder,
    showPlaceholderOnEmpty,
    tabIndex,
    titleRef,
    updatePageProperties,
    user,
    actions,
    extendedDocumentEditorProps,
  } = props;

  const { mainNavigationExtension, titleNavigationExtension, setMainEditor, setTitleEditor } = useEditorNavigation();

  // Memoize extensions to avoid unnecessary editor recreations
  const editorExtensions = useMemo(
    () => [
      SideMenuExtension({
        aiEnabled: !disabledExtensions?.includes("ai"),
        dragDropEnabled,
      }),
      HeadingListExtension,
      Collaboration.configure({
        document: provider.document,
        field: "default",
      }),
      ...extensions,
      ...DocumentEditorAdditionalExtensions({
        disabledExtensions,
        extendedEditorProps,
        fileHandler,
        flaggedExtensions,
        isEditable: editable,
        provider,
        userDetails: user,
      }),
      mainNavigationExtension,
    ],
    [
      provider,
      disabledExtensions,
      dragDropEnabled,
      extensions,
      extendedEditorProps,
      fileHandler,
      flaggedExtensions,
      editable,
      user,
      mainNavigationExtension,
    ]
  );

  // Editor configuration
  const editorConfig = useMemo<TEditorHookProps>(
    () => ({
      disabledExtensions,
      extendedEditorProps,
      id,
      editable,
      editorProps,
      editorClassName,
      enableHistory: false,
      extensions: editorExtensions,
      fileHandler,
      flaggedExtensions,
      forwardedRef,
      getEditorMetaData,
      handleEditorReady,
      isTouchDevice,
      mentionHandler,
      onAssetChange,
      onChange,
      onEditorFocus,
      onTransaction,
      placeholder,
      showPlaceholderOnEmpty,
      provider,
      tabIndex,
    }),
    [
      provider,
      disabledExtensions,
      extendedEditorProps,
      id,
      editable,
      editorProps,
      editorClassName,
      editorExtensions,
      fileHandler,
      flaggedExtensions,
      forwardedRef,
      getEditorMetaData,
      handleEditorReady,
      isTouchDevice,
      mentionHandler,
      onAssetChange,
      onChange,
      onEditorFocus,
      onTransaction,
      placeholder,
      showPlaceholderOnEmpty,
      tabIndex,
    ]
  );

  const editor = useEditor(editorConfig);

  useRealtimeEvents({
    editor,
    provider,
    id,
    updatePageProperties,
    signalForcedClose: actions.signalForcedClose,
  });

  const titleExtensions = useMemo(
    () => [
      Collaboration.configure({
        document: provider.document,
        field: "title",
      }),
      titleNavigationExtension,
    ],
    [provider, titleNavigationExtension]
  );

  const titleEditorConfig = useMemo<TUseTitleEditorProps>(
    () => ({
      id,
      editable,
      provider,
      titleRef,
      updatePageProperties,
      extensions: titleExtensions,
      extendedEditorProps,
      onFocus: extendedDocumentEditorProps?.onTitleFocus,
    }),
    [
      provider,
      id,
      editable,
      titleRef,
      updatePageProperties,
      titleExtensions,
      extendedEditorProps,
      extendedDocumentEditorProps?.onTitleFocus,
    ]
  );

  const titleEditor = useTitleEditor(titleEditorConfig);

  useEffect(() => {
    if (editor && titleEditor) {
      setMainEditor(editor);
      setTitleEditor(titleEditor);
    }
  }, [editor, titleEditor, setMainEditor, setTitleEditor]);

  return {
    editor,
    titleEditor,
  };
};
