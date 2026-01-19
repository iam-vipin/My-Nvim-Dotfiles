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

import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import type { EUserWorkspaceRoles } from "@plane/types";
import { cn } from "@plane/utils";
// components
import { SidebarNavItem } from "@/components/sidebar/sidebar-navigation";
// hooks
import { useAppTheme } from "@/hooks/store/use-app-theme";
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { UpgradeBadge } from "@/plane-web/components/workspace/upgrade-badge";
import { isSidebarFeatureEnabled } from "@/plane-web/helpers/dashboard.helper";

export type SidebarWorkspaceMenuItemProps = {
  item: {
    labelTranslationKey: string;
    key: string;
    href: string;
    Icon: any;
    access: EUserWorkspaceRoles[];
  };
};

export const SidebarWorkspaceMenuItem = observer(function SidebarWorkspaceMenuItem(
  props: SidebarWorkspaceMenuItemProps
) {
  const { item } = props;

  const { t } = useTranslation();
  // nextjs hooks
  const pathname = usePathname();
  const { workspaceSlug } = useParams();
  const { allowPermissions } = useUserPermissions();
  // store hooks
  const { toggleSidebar } = useAppTheme();

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  if (!allowPermissions(item.access as any, EUserPermissionsLevel.WORKSPACE, workspaceSlug.toString())) {
    return null;
  }

  if (!isSidebarFeatureEnabled(item.key, workspaceSlug.toString())) return null;

  const isActive = item.href === pathname;

  return (
    <Link href={item.href} onClick={() => handleLinkClick()}>
      <SidebarNavItem isActive={isActive}>
        <div className="flex items-center gap-1.5 py-[1px]">
          <item.Icon
            className={cn("size-4", {
              "rotate-180": item.key === "active_cycles",
            })}
          />
          <p className="text-13 leading-5 font-medium">{t(item.labelTranslationKey)}</p>
        </div>
        <div className="flex-shrink-0">
          <UpgradeBadge flag="WORKSPACE_ACTIVE_CYCLES" />
        </div>
      </SidebarNavItem>
    </Link>
  );
});
