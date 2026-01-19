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

import { assetDuplicationHandlers } from "@/plane-editor/helpers/asset-duplication";

// Utility function to process HTML content with all registered handlers
export const processAssetDuplication = (htmlContent: string): { processedHtml: string } => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  let processedHtml = htmlContent;

  // Process each registered component type
  for (const [componentName, handler] of Object.entries(assetDuplicationHandlers)) {
    const elements = tempDiv.querySelectorAll(componentName);

    if (elements.length > 0) {
      elements.forEach((element) => {
        const result = handler({ element, originalHtml: processedHtml });
        if (result.shouldProcess) {
          processedHtml = result.modifiedHtml;
        }
      });

      // Update tempDiv with processed HTML for next iteration
      tempDiv.innerHTML = processedHtml;
    }
  }

  return { processedHtml };
};
