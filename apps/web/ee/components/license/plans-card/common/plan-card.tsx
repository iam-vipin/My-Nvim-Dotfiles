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
import type { EProductSubscriptionEnum } from "@plane/types";
// plane imports
import { getSubscriptionName } from "@plane/utils";
// plane web imports
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";

type TPlanCard = {
  planVariant: EProductSubscriptionEnum;
  planDescription: React.ReactNode;
  button?: React.ReactNode;
};

export const PlanCard = observer(function PlanCard({ planVariant, planDescription, button }: TPlanCard) {
  const { getIsInTrialPeriod } = useWorkspaceSubscription();
  // derived values
  const planName = getSubscriptionName(planVariant);
  const isInTrialPeriod = getIsInTrialPeriod(false);

  return (
    <div className="flex gap-2 font-medium items-center justify-between">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-18 leading-6 font-bold text-accent-primary">
          {planName}
          {isInTrialPeriod && " trial"}
        </h4>
        <div className="text-13 text-secondary font-medium">{planDescription}</div>
      </div>
      {button && <div className="flex flex-col gap-1 items-center justify-center">{button}</div>}
    </div>
  );
});
