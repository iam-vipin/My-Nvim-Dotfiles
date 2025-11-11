"use client";

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
