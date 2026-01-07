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
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
// local imports
import { WorkspaceActiveCycleHeader } from "./header";

export default function WorkspaceActiveCycleLayout() {
  return (
    <WorkspaceAccessWrapper pageKey="active_cycles">
      <AppHeader header={<WorkspaceActiveCycleHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </WorkspaceAccessWrapper>
  );
}
