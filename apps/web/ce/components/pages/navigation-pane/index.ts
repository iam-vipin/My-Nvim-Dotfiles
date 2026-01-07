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

export type TPageNavigationPaneTab = "outline" | "info" | "assets";

export const PAGE_NAVIGATION_PANE_TABS_LIST: Record<
  TPageNavigationPaneTab,
  {
    key: TPageNavigationPaneTab;
    i18n_label: string;
  }
> = {
  outline: {
    key: "outline",
    i18n_label: "page_navigation_pane.tabs.outline.label",
  },
  info: {
    key: "info",
    i18n_label: "page_navigation_pane.tabs.info.label",
  },
  assets: {
    key: "assets",
    i18n_label: "page_navigation_pane.tabs.assets.label",
  },
};

export const ORDERED_PAGE_NAVIGATION_TABS_LIST: {
  key: TPageNavigationPaneTab;
  i18n_label: string;
}[] = [
  PAGE_NAVIGATION_PANE_TABS_LIST.outline,
  PAGE_NAVIGATION_PANE_TABS_LIST.info,
  PAGE_NAVIGATION_PANE_TABS_LIST.assets,
];
