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
import type { IParserExtension } from "@/lib/parser";
import { NotionPageParserExtension } from "../../../common/content-parser";

export class ConfluencePageParserExtension extends NotionPageParserExtension implements IParserExtension {
  shouldParse(node: HTMLElement): boolean {
    const hasAnchorTag = node.tagName === "A";
    const isConfluenceLink = node.getAttribute("href")?.includes("/pages/") ?? false;
    const isHTMLPage = node.getAttribute("href")?.endsWith(".html") ?? false;
    return hasAnchorTag && (isConfluenceLink || isHTMLPage);
  }

  protected normalizeFilePath(src: string): string | undefined {
    if (src.startsWith("http")) {
      return super.normalizeFilePath(src);
    } else {
      // In this case we are expecting a src like aaaa_id.html
      const id = src.split("_").pop()?.replace(".html", "");
      return id;
    }
  }
}
