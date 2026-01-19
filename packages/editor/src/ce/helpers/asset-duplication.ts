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

import { v4 as uuidv4 } from "uuid";
import { ECustomImageAttributeNames, ECustomImageStatus } from "@/extensions/custom-image/types";

export type AssetDuplicationContext = {
  element: Element;
  originalHtml: string;
};

export type AssetDuplicationResult = {
  modifiedHtml: string;
  shouldProcess: boolean;
};

export type AssetDuplicationHandler = (context: AssetDuplicationContext) => AssetDuplicationResult;

const imageComponentHandler: AssetDuplicationHandler = ({ element, originalHtml }) => {
  const src = element.getAttribute("src");

  if (!src || src.startsWith("http")) {
    return { modifiedHtml: originalHtml, shouldProcess: false };
  }

  // Capture the original HTML BEFORE making any modifications
  const originalTag = element.outerHTML;

  // Use setAttribute to update attributes
  const newId = uuidv4();
  element.setAttribute(ECustomImageAttributeNames.STATUS, ECustomImageStatus.DUPLICATING);
  element.setAttribute(ECustomImageAttributeNames.ID, newId);

  // Get the modified HTML AFTER the changes
  const modifiedTag = element.outerHTML;
  const modifiedHtml = originalHtml.replaceAll(originalTag, modifiedTag);

  return { modifiedHtml, shouldProcess: true };
};

export const assetDuplicationHandlers: Record<string, AssetDuplicationHandler> = {
  "image-component": imageComponentHandler,
};
