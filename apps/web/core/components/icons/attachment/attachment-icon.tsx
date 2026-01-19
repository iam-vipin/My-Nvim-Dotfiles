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

import {
  AudioIcon,
  CssIcon,
  CsvIcon,
  DefaultIcon,
  DocIcon,
  FigmaIcon,
  HtmlIcon,
  JavaScriptIcon,
  JpgIcon,
  PdfIcon,
  PngIcon,
  RarIcon,
  SheetIcon,
  SvgIcon,
  TxtIcon,
  VideoIcon,
  ZipIcon,
} from "@/components/icons/attachment";

export const getFileIcon = (fileType: string, size: number = 28) => {
  switch (fileType) {
    case "pdf":
      return <PdfIcon height={size} width={size} />;
    case "csv":
      return <CsvIcon height={size} width={size} />;
    case "xlsx":
      return <SheetIcon height={size} width={size} />;
    case "css":
      return <CssIcon height={size} width={size} />;
    case "doc":
      return <DocIcon height={size} width={size} />;
    case "fig":
      return <FigmaIcon height={size} width={size} />;
    case "html":
      return <HtmlIcon height={size} width={size} />;
    case "png":
      return <PngIcon height={size} width={size} />;
    case "jpg":
      return <JpgIcon height={size} width={size} />;
    case "js":
      return <JavaScriptIcon height={size} width={size} />;
    case "txt":
      return <TxtIcon height={size} width={size} />;
    case "svg":
      return <SvgIcon height={size} width={size} />;
    case "mp3":
      return <AudioIcon height={size} width={size} />;
    case "wav":
      return <AudioIcon height={size} width={size} />;
    case "mp4":
      return <VideoIcon height={size} width={size} />;
    case "wmv":
      return <VideoIcon height={size} width={size} />;
    case "mkv":
      return <VideoIcon height={size} width={size} />;
    case "zip":
      return <ZipIcon height={size} width={size} />;
    case "rar":
      return <RarIcon height={size} width={size} />;

    default:
      return <DefaultIcon height={size} width={size} />;
  }
};
