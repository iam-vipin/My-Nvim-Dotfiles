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

/**
 * @description function to extract all additional assets from HTML content
 * @param htmlContent
 * @returns {string[]} array of additional asset sources
 */
export const extractAdditionalAssetsFromHTMLContent = (_htmlContent: string): string[] => [];

/**
 * @description function to replace additional assets in HTML content with new IDs
 * @param props
 * @returns {string} HTML content with replaced additional assets
 */
export const replaceAdditionalAssetsInHTMLContent = (props: {
  htmlContent: string;
  assetMap: Record<string, string>;
}): string => {
  const { htmlContent } = props;
  return htmlContent;
};
