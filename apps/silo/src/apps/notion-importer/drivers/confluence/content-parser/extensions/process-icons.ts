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

import { HTMLElement } from "node-html-parser";
import type { IParserExtension } from "@/lib/parser";

export class ConfluenceIconParserExtension implements IParserExtension {
  shouldParse(node: HTMLElement): boolean {
    return node.tagName === "IMG";
  }

  async mutate(node: HTMLElement): Promise<HTMLElement> {
    const src = node.getAttribute("src");
    if (!src) return node;

    if (src.includes("emoticons")) {
      const pTag = new HTMLElement("p", {}, "");
      pTag.innerHTML = node.getAttribute("data-emoji-fallback") || "";
      return pTag;
    }

    if (src.includes("icons") || src.includes("thumbnails")) {
      // Remove the html element completely
      node.remove();
      return new HTMLElement("span", {}, "");
    }

    return node;
  }
}
