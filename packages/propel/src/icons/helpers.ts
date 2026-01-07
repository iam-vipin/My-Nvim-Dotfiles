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

import type { IconName } from "./registry";
import { ICON_REGISTRY } from "./registry";

/**
 * Get the icon component by name
 * @param name - The icon name from the registry
 * @returns The icon component or default icon if not found
 */
export const getIconComponent = (name: IconName) => ICON_REGISTRY[name] || ICON_REGISTRY.default;

/**
 * Check if the icon name exists in the registry
 * @param name - The icon name to check
 * @returns True if the icon exists in the registry
 */
export const isValidIconName = (name: string): name is IconName => name in ICON_REGISTRY;

/**
 * Get all available icon names
 * @returns Array of all icon names in the registry
 */
export const getIconNames = (): IconName[] => Object.keys(ICON_REGISTRY) as IconName[];

/**
 * Get icons by category
 * @param category - The category prefix (e.g., 'workspace', 'project')
 * @returns Array of icon names matching the category
 */
export const getIconsByCategory = (category: string): IconName[] =>
  getIconNames().filter((name) => name.startsWith(`${category}.`));
