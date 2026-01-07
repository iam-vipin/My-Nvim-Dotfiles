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
