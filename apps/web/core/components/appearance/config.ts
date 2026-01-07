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

import { SmoothCursorToggle } from "./smooth-cursor-toggle";
import { ThemeSwitcher } from "./theme-switcher";

export interface PreferenceOption {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{ option: PreferenceOption }>;
}

export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  {
    id: "theme",
    title: "theme",
    description: "select_or_customize_your_interface_color_scheme",
    component: ThemeSwitcher,
  },
  {
    id: "smooth_cursor",
    title: "smooth_cursor",
    description: "select_the_cursor_motion_style_that_feels_right_for_you",
    component: SmoothCursorToggle,
  },
];
