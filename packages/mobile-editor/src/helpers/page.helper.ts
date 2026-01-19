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
 * @description returns the name of the project after checking for untitled page
 * @param {string | undefined} name
 * @returns {string}
 */
export const getPageName = (name: string | undefined) => {
  if (name === undefined) return "";
  if (!name || name.trim() === "") return "Untitled";
  return name;
};
