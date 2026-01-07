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

export type TCommandPaletteActionList = Record<string, { title: string; description: string; action: () => void }>;

export type TCommandPaletteShortcutList = {
  key: string;
  title: string;
  shortcuts: TCommandPaletteShortcut[];
};

export type TCommandPaletteShortcut = {
  keys: string; // comma separated keys
  description: string;
};
