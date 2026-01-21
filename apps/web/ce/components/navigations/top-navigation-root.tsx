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

// components
import { TopNavPowerK } from "@/components/navigation";
import { HelpMenuRoot } from "@/components/workspace/sidebar/help-section/root";
import { UserMenuRoot } from "@/components/workspace/sidebar/user-menu-root";
import { WorkspaceMenuRoot } from "@/components/workspace/sidebar/workspace-menu-root";
import { useAppRailPreferences } from "@/hooks/use-navigation-preferences";
import { cn } from "@plane/utils";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// local imports
import { StarUsOnGitHubLink } from "@/app/(all)/[workspaceSlug]/(projects)/star-us-link";
import { NotificationsRoot } from "@/components/workspace-notifications";

export const TopNavigationRoot = observer(function TopNavigationRoot() {
  // router
  const { workspaceSlug } = useParams();

  // store hooks
  const { preferences } = useAppRailPreferences();
  const showLabel = preferences.displayMode === "icon_with_label";

  return (
    <div
      className={cn("flex items-center min-h-10 w-full px-3.5 bg-canvas z-[27] transition-all duration-300", {
        "px-2": !showLabel,
      })}
    >
      {/* Workspace Menu */}
      <div className="shrink-0 flex-1">
        <WorkspaceMenuRoot variant="top-navigation" />
      </div>
      {/* Power K Search */}
      <div className="shrink-0" data-tour="navigation-step-1">
        <TopNavPowerK />
      </div>
      {/* Additional Actions */}
      <div className="shrink-0 flex-1 flex gap-1 items-center justify-end">
        <NotificationsRoot workspaceSlug={workspaceSlug?.toString()} />
        <HelpMenuRoot />
        <StarUsOnGitHubLink />
        <div className="flex items-center justify-center size-8 hover:bg-layer-1-hover rounded-md">
          <UserMenuRoot />
        </div>
      </div>
    </div>
  );
});
