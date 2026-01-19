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
import { Outlet } from "react-router";
// wrappers
import { ProjectsAppPowerKProvider } from "@/components/power-k/projects-app-provider";
import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";
// layout
import { ProfileLayoutSidebar } from "./sidebar";

export default function ProfileSettingsLayout() {
  return (
    <>
      <ProjectsAppPowerKProvider />
      <AuthenticationWrapper>
        <div className="relative flex h-full w-full overflow-hidden rounded-lg border border-subtle">
          <ProfileLayoutSidebar />
          <main className="relative flex h-full w-full flex-col overflow-hidden bg-surface-1">
            <div className="h-full w-full overflow-hidden">
              <Outlet />
            </div>
          </main>
        </div>
      </AuthenticationWrapper>
    </>
  );
}
