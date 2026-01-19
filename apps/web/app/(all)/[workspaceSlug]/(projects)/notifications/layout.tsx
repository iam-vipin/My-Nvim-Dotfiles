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

import { Outlet } from "react-router";
// components
import { NotificationsSidebarRoot } from "@/components/workspace-notifications/sidebar";

export default function ProjectInboxIssuesLayout() {
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center">
      <NotificationsSidebarRoot />
      <div className="w-full h-full overflow-hidden overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
