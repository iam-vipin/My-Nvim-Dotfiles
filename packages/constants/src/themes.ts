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

export const THEMES = ["light", "dark", "light-contrast", "dark-contrast", "custom"];

export interface I_THEME_OPTION {
  key: string;
  value: string;
  i18n_label: string;
  type: string;
  icon: {
    border: string;
    color1: string;
    color2: string;
  };
}

export const THEME_OPTIONS: I_THEME_OPTION[] = [
  {
    key: "system_preference",
    value: "system",
    i18n_label: "System preference",
    type: "light",
    icon: {
      border: "#DEE2E6",
      color1: "#FAFAFA",
      color2: "#3F76FF",
    },
  },
  {
    key: "light",
    value: "light",
    i18n_label: "Light",
    type: "light",
    icon: {
      border: "#DEE2E6",
      color1: "#FAFAFA",
      color2: "#3F76FF",
    },
  },
  {
    key: "dark",
    value: "dark",
    i18n_label: "Dark",
    type: "dark",
    icon: {
      border: "#2E3234",
      color1: "#191B1B",
      color2: "#3C85D9",
    },
  },
  {
    key: "light_contrast",
    value: "light-contrast",
    i18n_label: "Light high contrast",
    type: "light",
    icon: {
      border: "#000000",
      color1: "#FFFFFF",
      color2: "#3F76FF",
    },
  },
  {
    key: "dark_contrast",
    value: "dark-contrast",
    i18n_label: "Dark high contrast",
    type: "dark",
    icon: {
      border: "#FFFFFF",
      color1: "#030303",
      color2: "#3A8BE9",
    },
  },
  {
    key: "custom",
    value: "custom",
    i18n_label: "Custom theme",
    type: "light",
    icon: {
      border: "#FFC9C9",
      color1: "#FFF7F7",
      color2: "#FF5151",
    },
  },
];
