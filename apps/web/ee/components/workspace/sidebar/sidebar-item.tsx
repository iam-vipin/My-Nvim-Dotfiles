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
import { useParams } from "next/navigation";
import type { IWorkspaceSidebarNavigationItem } from "@plane/constants";
import { SidebarItemBase } from "@/components/workspace/sidebar/sidebar-item";
import { isSidebarFeatureEnabled } from "@/plane-web/helpers/dashboard.helper";
import { UpgradeBadge } from "../upgrade-badge";

type Props = {
  item: IWorkspaceSidebarNavigationItem;
};

export function SidebarItem({ item }: Props) {
  const { workspaceSlug } = useParams();

  if (!isSidebarFeatureEnabled(item.key, workspaceSlug.toString())) return null;

  return (
    <SidebarItemBase
      item={item}
      additionalRender={(key) =>
        key === "active_cycles" ? (
          <div className="flex-shrink-0">
            <UpgradeBadge flag="WORKSPACE_ACTIVE_CYCLES" />
          </div>
        ) : null
      }
    />
  );
}
