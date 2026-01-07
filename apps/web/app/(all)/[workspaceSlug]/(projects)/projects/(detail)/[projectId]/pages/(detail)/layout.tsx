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

// component
import { Outlet } from "react-router";
import useSWR from "swr";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// plane web hooks
import { EPageStoreType, usePageStore } from "@/plane-web/hooks/store";
// local components
import type { Route } from "./+types/layout";
import { PageDetailsHeader } from "./header";

export default function ProjectPageDetailsLayout({ params }: Route.ComponentProps) {
  const { workspaceSlug, projectId } = params;
  const { fetchPagesList } = usePageStore(EPageStoreType.PROJECT);
  // fetching pages list
  useSWR(`PROJECT_PAGES_${projectId}`, () => fetchPagesList(workspaceSlug, projectId));
  return (
    <>
      <AppHeader header={<PageDetailsHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}
