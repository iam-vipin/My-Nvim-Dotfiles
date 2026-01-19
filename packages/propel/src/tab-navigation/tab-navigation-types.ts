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

import type { ReactNode } from "react";

export type TTabNavigationItemProps = {
  /** The content to display inside the tab (icons, text, etc.) */
  children: ReactNode;
  /** Whether this tab is currently active */
  isActive: boolean;
  /** Additional CSS class names */
  className?: string;
};

export type TTabNavigationListProps = {
  /** The navigation items (each should be a TabNavigationItem wrapped in a routing component) */
  children: ReactNode;
  /** Additional CSS class names for the container */
  className?: string;
};
