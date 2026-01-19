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
 * Renders an emoji or icon
 * @param {string | { name: string; color: string }} emoji - The emoji or icon to render
 * @returns {React.ReactNode} The rendered emoji or icon
 */
export const renderEmoji = (
  emoji:
    | string
    | {
        name: string;
        color: string;
      }
): React.ReactNode => {
  if (!emoji) return;

  if (typeof emoji === "object")
    return (
      <span style={{ fontSize: "16px", color: emoji.color }} className="material-symbols-rounded">
        {emoji.name}
      </span>
    );
  else return isNaN(parseInt(emoji)) ? emoji : String.fromCodePoint(parseInt(emoji));
};
