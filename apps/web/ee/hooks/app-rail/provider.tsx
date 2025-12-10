import React, { useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { AppRailVisibilityProvider as CoreProvider } from "@/lib/app-rail";
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";
import { useFlag } from "@/plane-web/hooks/store/use-flag";

interface AppRailVisibilityProviderProps {
  children: React.ReactNode;
}

/**
 * EE AppRailVisibilityProvider
 * Wraps core provider with feature flag and subscription checks
 */
export const AppRailVisibilityProvider = observer(function AppRailVisibilityProvider({
  children,
}: AppRailVisibilityProviderProps) {
  const { workspaceSlug } = useParams();

  // Check feature flag
  const isFeatureFlagEnabled = useFlag(workspaceSlug?.toString(), "APP_RAIL", false);

  // Check subscription details
  const workspaceSubscription = useWorkspaceSubscription();
  const subscriptionDetail = workspaceSubscription.currentWorkspaceSubscribedPlanDetail;

  // EE Logic: Feature is NOT enabled for free self-managed workspaces
  const isFreeForSelfManaged = subscriptionDetail?.is_self_managed === true && subscriptionDetail?.product === "FREE";

  // Feature is enabled if:
  // 1. Feature flag is on AND
  // 2. NOT (free self-managed workspace)
  const isEnabled = useMemo(
    () => isFeatureFlagEnabled && !isFreeForSelfManaged,
    [isFeatureFlagEnabled, isFreeForSelfManaged]
  );

  return <CoreProvider isEnabled={isEnabled}>{children}</CoreProvider>;
});
