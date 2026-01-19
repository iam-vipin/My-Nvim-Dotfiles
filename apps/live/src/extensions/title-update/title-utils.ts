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

import * as Y from "yjs";
import type { XmlFragment, XmlText, XmlElement } from "yjs";

type XmlContainer = XmlFragment | XmlElement;
type XmlChild = XmlElement | XmlText;

const isXmlText = (node: XmlChild): node is XmlText => node instanceof Y.XmlText;

/**
 * Extracts plain text directly from a Yjs XmlFragment by traversing its children.
 * Uses XmlText.toString() for efficient text extraction.
 * Note: Non-string inserts (embeds/mentions) are ignored.
 */
export const extractTextFromXmlFragment = (xml: XmlContainer): string => {
  const children = xml.toArray() as XmlChild[];

  return children
    .map((child) => {
      if (isXmlText(child)) {
        return child.toString() as string;
      }
      return extractTextFromXmlFragment(child);
    })
    .join("");
};
