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

import { DashboardIcon } from "@plane/propel/icons";
// ce constants
import {
  FAVORITE_ITEM_ICONS as CE_FAVORITE_ITEM_ICONS,
  FAVORITE_ITEM_LINKS as CE_FAVORITE_ITEM_LINKS,
} from "@/ce/constants/sidebar-favorites";

export const FAVORITE_ITEM_ICONS: typeof CE_FAVORITE_ITEM_ICONS = {
  ...CE_FAVORITE_ITEM_ICONS,
  workspace_dashboard: DashboardIcon,
};

export const FAVORITE_ITEM_LINKS: typeof CE_FAVORITE_ITEM_LINKS = {
  ...CE_FAVORITE_ITEM_LINKS,
  workspace_dashboard: {
    itemLevel: "workspace",
    getLink: (favorite) => `dashboards/${favorite.entity_identifier}`,
  },
};
