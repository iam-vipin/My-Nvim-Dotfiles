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

import { useCallback } from "react";
// plane imports
import type { IFavorite } from "@plane/types";
// components
import { getFavoriteItemIcon } from "@/components/workspace/sidebar/favorites/favorite-items/common";
import { useDashboards } from "./store";

export const useAdditionalFavoriteItemDetails = () => {
  // store hooks
  const { getDashboardById } = useDashboards();

  const getAdditionalFavoriteItemDetails = useCallback(
    (_workspaceSlug: string, favorite: IFavorite) => {
      const { entity_identifier: favoriteItemId, entity_type: favoriteItemEntityType } = favorite;
      const favoriteItemName = favorite?.entity_data?.name || favorite?.name;

      let itemIcon;
      let itemTitle: string | undefined;

      switch (favoriteItemEntityType) {
        case "workspace_dashboard": {
          const dashboardDetails = getDashboardById(favoriteItemId ?? "");
          itemTitle = dashboardDetails?.name;
          itemIcon = getFavoriteItemIcon("workspace_dashboard");
          break;
        }
        default:
          itemTitle = favoriteItemName;
          itemIcon = getFavoriteItemIcon(favoriteItemEntityType);
          break;
      }
      return { itemIcon, itemTitle: itemTitle || favoriteItemName };
    },
    [getDashboardById]
  );

  return {
    getAdditionalFavoriteItemDetails,
  };
};
