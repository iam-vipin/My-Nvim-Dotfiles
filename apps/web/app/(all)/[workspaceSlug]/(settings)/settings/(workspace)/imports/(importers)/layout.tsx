"use client";

import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Outlet } from "react-router";
import { SILO_BASE_URL, SILO_BASE_PATH } from "@plane/constants";
import { ChevronLeftIcon } from "@plane/propel/icons";
// hooks
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { useUser } from "@/hooks/store/user";

const ImporterLayout = observer(() => {
  // router params
  const { workspaceSlug: workspaceSlugParam } = useParams();

  // hooks
  const { currentWorkspace } = useWorkspace();
  const { data: currentUser } = useUser();

  // derived values
  const siloBaseUrl = encodeURI(SILO_BASE_URL + SILO_BASE_PATH) || undefined;
  const workspaceSlug = workspaceSlugParam?.toString() || undefined;
  const workspaceId = currentWorkspace?.id || undefined;
  const userId = currentUser?.id || undefined;

  // check if workspace exists
  if (!workspaceSlug || !workspaceId || !userId || !siloBaseUrl) return null;

  return (
    <SettingsContentWrapper size="lg">
      <Link
        href={`/${workspaceSlug}/settings/imports`}
        className="flex items-center gap-2 text-sm text-custom-text-300 font-semibold pb-4"
      >
        <ChevronLeftIcon className="size-4" />
        <span>Back to Imports</span>
      </Link>
      <Outlet />
    </SettingsContentWrapper>
  );
});

export default ImporterLayout;
