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

import type { Node as ProseMirrorNode } from "@tiptap/core";
import type { Range } from "@tiptap/react";
import type { EExternalEmbedAttributeNames, ExternalEmbedNodeViewProps } from "@/plane-editor/types/external-embed";

// Extension-specific Types
export type ExternalEmbedProps = {
  widgetCallback: (props: ExternalEmbedNodeViewProps) => React.ReactNode;
  isFlagged: boolean;
  onClick?: () => void;
};

export type InsertExternalEmbedCommandProps = {
  [EExternalEmbedAttributeNames.IS_RICH_CARD]: boolean;
  [EExternalEmbedAttributeNames.SOURCE]?: string;
  pos?: number | Range;
};

export type ExternalEmbedExtensionOptions = {
  externalEmbedCallbackComponent: (props: ExternalEmbedNodeViewProps) => React.ReactNode;
  isFlagged: boolean;
  onClick?: () => void;
};

export type ExternalEmbedExtensionStorage = {
  posToInsert: { from: number; to: number };
  url: string;
  openInput: boolean;
  isPasteDialogOpen: boolean;
};

export type ExternalEmbedExtension = ProseMirrorNode<ExternalEmbedExtensionOptions, ExternalEmbedExtensionStorage>;
