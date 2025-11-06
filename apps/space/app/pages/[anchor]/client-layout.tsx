"use client";

import { observer } from "mobx-react";
import { Outlet } from "react-router";
import useSWR from "swr";
// components
import { LogoSpinner } from "@/components/common/logo-spinner";
// hooks
import { PageNotFound } from "@/components/ui/not-found";
import { usePublish, usePublishList } from "@/hooks/store/publish";
// plane web components
import { PageDetailsError } from "@/plane-web/components/pages";
import type { Route } from "./+types/client-layout";

export const PagesClientLayout = observer((props: Route.ComponentProps) => {
  const { anchor } = props.params;
  // store hooks
  const { fetchPublishSettings } = usePublishList();
  const { entity_identifier } = usePublish(anchor);
  // fetch publish settings
  const { error } = useSWR(
    anchor ? `PUBLISH_SETTINGS_${anchor}` : null,
    anchor ? () => fetchPublishSettings(anchor) : null
  );

  if (!entity_identifier && !error)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LogoSpinner />
      </div>
    );

  if (error?.status === 404) return <PageNotFound />;

  if (error) return <PageDetailsError />;

  return (
    <div className="size-full flex flex-col">
      <Outlet />
    </div>
  );
});

export default PagesClientLayout;
