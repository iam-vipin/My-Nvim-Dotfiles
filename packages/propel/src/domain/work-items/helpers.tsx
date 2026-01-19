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

import type { FC } from "react";
import { AudioFileIcon, CodeFileIcon, DocumentFileIcon, ImageFileIcon, VideoFileIcon } from "../../icons/attachments";

const extensionToIconMap: Record<string, FC<{ className?: string }>> = {
  pdf: DocumentFileIcon,
  doc: DocumentFileIcon,
  docx: DocumentFileIcon,
  csv: DocumentFileIcon,
  xls: DocumentFileIcon,
  xlsx: DocumentFileIcon,
  txt: DocumentFileIcon,
  md: DocumentFileIcon,
  jpg: ImageFileIcon,
  jpeg: ImageFileIcon,
  png: ImageFileIcon,
  gif: ImageFileIcon,
  svg: ImageFileIcon,
  webp: ImageFileIcon,
  mp4: VideoFileIcon,
  mov: VideoFileIcon,
  mkv: VideoFileIcon,
  avi: VideoFileIcon,
  mp3: AudioFileIcon,
  wav: AudioFileIcon,
  flac: AudioFileIcon,
  js: CodeFileIcon,
  ts: CodeFileIcon,
  json: CodeFileIcon,
  html: CodeFileIcon,
  css: CodeFileIcon,
  jsx: CodeFileIcon,
  tsx: CodeFileIcon,
};

function DefaultIcon(props: { className?: string }) {
  return <DocumentFileIcon {...props} />;
}

export const getAttachmentIcon = (extension: string) => {
  const normalizedExtension = extension.toLowerCase();
  return extensionToIconMap[normalizedExtension] ?? DefaultIcon;
};
