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

import type { FC } from "react";
import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
// plane helpers
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
// components
import { SidebarWrapper } from "@/components/sidebar/sidebar-wrapper";
import { SidebarFavoritesMenu } from "@/components/workspace/sidebar/favorites/favorites-menu";
import { SidebarProjectsList } from "@/components/workspace/sidebar/projects-list";
import { SidebarQuickActions } from "@/components/workspace/sidebar/quick-actions";
import { SidebarMenuItems } from "@/components/workspace/sidebar/sidebar-menu-items";
// hooks
import { useFavorite } from "@/hooks/store/use-favorite";
import { useUserPermissions } from "@/hooks/store/user";
// plane web components
import { SidebarTeamsList } from "@/plane-web/components/workspace/sidebar/teamspaces/root";

export const AppSidebar = observer(function AppSidebar() {
  // store hooks
  const { allowPermissions } = useUserPermissions();
  const { groupedFavorites } = useFavorite();

  // derived values
  const canPerformWorkspaceMemberActions = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  const isFavoriteEmpty = isEmpty(groupedFavorites);

  return (
    <SidebarWrapper title="Projects" quickActions={<SidebarQuickActions />}>
      <SidebarMenuItems />
      {/* Favorites Menu */}
      {canPerformWorkspaceMemberActions && !isFavoriteEmpty && <SidebarFavoritesMenu />}
      {/* Teams List */}
      <SidebarTeamsList />
      {/* Projects List */}
      <SidebarProjectsList />
    </SidebarWrapper>
  );
});
