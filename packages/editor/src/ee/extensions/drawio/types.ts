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
import type { TFileHandler } from "@/types";

// Core Enums
export enum EDrawioAttributeNames {
  ID = "id",
  IMAGE_SRC = "data-image-src", // SVG file source/URL
  XML_SRC = "data-xml-src", // XML .drawio file source/URL
  MODE = "data-mode", // Mode: "diagram" or "board"
}

export enum EDrawioMode {
  DIAGRAM = "diagram",
  BOARD = "board",
}

// Core Types with strict mapping
export type TDrawioBlockAttributes = {
  [EDrawioAttributeNames.ID]: string | null;
  [EDrawioAttributeNames.IMAGE_SRC]: string | null; // SVG file source/URL for display
  [EDrawioAttributeNames.XML_SRC]: string | null; // XML .drawio file source/URL for editing
  [EDrawioAttributeNames.MODE]: EDrawioMode; // Mode: diagram or board
};

export type InsertDrawioCommandProps = {
  pos?: number | Range;
  mode: EDrawioMode;
};

export type DrawioExtensionOptions = {
  onClick?: () => void;
  isFlagged: boolean;
  getDiagramSrc: TFileHandler["getAssetSrc"];
  getFileContent?: TFileHandler["getFileContent"]; // Use TFileHandler type directly
  restoreDiagram: TFileHandler["restore"];
  uploadDiagram: TFileHandler["upload"];
  reuploadDiagram?: TFileHandler["reupload"];
  logoSpinner?: React.ComponentType;
};

export type DrawioExtensionStorage = {
  posToInsert: { from: number; to: number };
  openDialog: boolean;
};

export type TDrawioExtension = ProseMirrorNode<DrawioExtensionOptions, DrawioExtensionStorage>;
