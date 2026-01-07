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

import type { HTMLElement } from "node-html-parser";
import type { FileHelperConfig } from "../../helpers";
import { FileHelper } from "../../helpers";
import type { IParserExtension } from "../../types";

export type ExternalFileParserConfig = FileHelperConfig & {
  /*
    Required by the file helper to create a link from an asset ID
  */
  apiBaseUrl: string;
  /*
    Both files and links are embedded with a tag, now we need to distinguish between the two.
    For the same reason we take the fileUrlPrefix, we use the acceptedFileUrlPrefix to determine
    if the file should be downloaded.
  */
  downloadableUrlPrefix: string;
};

/*
  This extension is used to parse files from external sources and upload them to Plane.
*/
export class ExternalFileParserExtension implements IParserExtension {
  private fileHelper: FileHelper;

  constructor(private readonly config: ExternalFileParserConfig) {
    this.fileHelper = new FileHelper(config);
  }

  shouldParse(node: HTMLElement): boolean {
    return (node.tagName === "A" && node.getAttribute("href")?.startsWith(this.config.downloadableUrlPrefix)) ?? false;
  }

  async mutate(node: HTMLElement): Promise<HTMLElement> {
    const href = node.getAttribute("href");
    if (!href) {
      return node;
    }

    const assetId = await this.fileHelper.downloadAndUploadFile(href);
    if (!assetId) {
      return node;
    }

    const link = this.fileHelper.createLinkFromAssetId(this.config.apiBaseUrl, assetId);
    node.setAttribute("href", link);
    return node;
  }
}
