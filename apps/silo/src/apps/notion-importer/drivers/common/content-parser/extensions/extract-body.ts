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
import { logger } from "@plane/logger";
import type { IParserExtension } from "@/lib/parser";

export type ExtractBodyExtensionConfig = {
  selector: string;
  context: Map<string, any>;
};

export class ExtractBodyExtension implements IParserExtension {
  constructor(protected readonly config: ExtractBodyExtensionConfig) {}

  shouldParse(node: HTMLElement): boolean {
    // This extension should only run on the root html element
    if (node.tagName !== "HTML") {
      return false;
    }

    // Check if the expected structure exists
    const pageBodyElement = node.querySelector(this.config.selector);
    return pageBodyElement !== null;
  }

  async mutate(node: HTMLElement): Promise<HTMLElement> {
    try {
      // Find the div with class "page-body"
      const pageBodyElement = node.querySelector(this.config.selector);

      if (!pageBodyElement) {
        // If we can't find the target element, return the original node
        logger.warn(`ExtractBodyExtension: Could not find ${this.config.selector} element`);
        return node;
      }

      return pageBodyElement;
    } catch (error) {
      logger.error("ExtractBodyExtension: Error while extracting body", error);
      return node;
    }
  }
}
