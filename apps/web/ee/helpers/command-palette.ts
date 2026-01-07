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

// types
import type { TCommandPaletteActionList, TCommandPaletteShortcut, TCommandPaletteShortcutList } from "@plane/types";
// ce helpers
import {
  getGlobalShortcutsList as getGlobalShortcutsListCE,
  getWorkspaceShortcutsList as getWorkspaceShortcutsListCE,
  getProjectShortcutsList as getProjectShortcutsListCE,
  getNavigationShortcutsList as getNavigationShortcutsListCE,
  getCommonShortcutsList as getCommonShortcutsListCE,
} from "@/ce/helpers/command-palette";

export const getGlobalShortcutsList: () => TCommandPaletteActionList = () => ({
  ...getGlobalShortcutsListCE(),
});

export const getWorkspaceShortcutsList: () => TCommandPaletteActionList = () => ({
  ...getWorkspaceShortcutsListCE(),
});

export const getProjectShortcutsList: () => TCommandPaletteActionList = () => ({
  ...getProjectShortcutsListCE(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleAdditionalKeyDownEvents = (e: KeyboardEvent) => null;

export const getNavigationShortcutsList = (): TCommandPaletteShortcut[] => [...getNavigationShortcutsListCE()];

export const getCommonShortcutsList = (platform: string): TCommandPaletteShortcut[] => [
  ...getCommonShortcutsListCE(platform),
];

export const getAdditionalShortcutsList = (): TCommandPaletteShortcutList[] => [];
