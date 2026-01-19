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
import useSWR from "swr";
// plane web hooks
import { EPageStoreType, usePageStore } from "@/plane-web/hooks/store";
import type { Route } from "./+types/layout";

export default function TeamspacePagesLayout({ params }: Route.ComponentProps) {
  const { workspaceSlug, teamspaceId } = params;
  // store hooks
  const { fetchPagesList } = usePageStore(EPageStoreType.TEAMSPACE);
  // fetch teamspace pages
  useSWR(["teamspacePages", workspaceSlug, teamspaceId], () => fetchPagesList(workspaceSlug, teamspaceId), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });
  return <Outlet />;
}
