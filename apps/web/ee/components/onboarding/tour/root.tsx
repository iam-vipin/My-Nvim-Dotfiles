import { observer } from "mobx-react";
// ce imports
import type { TOnboardingTourProps } from "@/ce/components/onboarding/tour/root";
import { TourRoot as CETourRoot } from "@/ce/components/onboarding/tour/root";
// plane web imports
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";
// local imports
import { BusinessPlanFeatures } from "./business-plan-features";
import { EProductSubscriptionEnum } from "@plane/types";

export const TourRoot = observer(function TourRoot(props: TOnboardingTourProps) {
  // store hooks
  const { currentWorkspaceSubscribedPlanDetail: subscriptionDetail } = useWorkspaceSubscription();
  // derived values
  const isSelfHosted = !!subscriptionDetail?.is_self_managed;
  const isOnBusinessPlan = subscriptionDetail?.product === EProductSubscriptionEnum.BUSINESS;

  if (!isSelfHosted && isOnBusinessPlan) {
    return <BusinessPlanFeatures onComplete={props.onComplete} />;
  }

  return <CETourRoot onComplete={props.onComplete} />;
});
