"use client";

import { observer } from "mobx-react";
// components
import { Outlet } from "react-router";
import { PageHead } from "@/components/core/page-title";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web components
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
import { InitiativesUpgrade } from "@/plane-web/components/initiatives/upgrade";
// plane web hooks
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import type { Route } from "./+types/layout";

function InitiativesLayout({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  // store
  const { currentWorkspace } = useWorkspace();
  // plane web stores
  const { isWorkspaceFeatureEnabled, loader } = useWorkspaceFeatures();
  const isInitiativesFeatureEnabled = isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_INITIATIVES_ENABLED);

  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - Initiatives` : undefined;
  const shouldUpgrade = currentWorkspace && !isInitiativesFeatureEnabled && !loader;

  return (
    <WorkspaceAccessWrapper pageKey="initiatives">
      {shouldUpgrade ? (
        <div className="h-full w-full max-w-5xl mx-auto flex items-center justify-center">
          <InitiativesUpgrade workspaceSlug={workspaceSlug} redirect />
        </div>
      ) : (
        <>
          <PageHead title={pageTitle} />
          <Outlet />
        </>
      )}
    </WorkspaceAccessWrapper>
  );
}

export default observer(InitiativesLayout);
