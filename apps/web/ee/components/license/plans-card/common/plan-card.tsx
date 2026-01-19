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
    <div className="w-full bg-layer-2 rounded-lg border border-subtle px-4 py-3 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 md:gap-8">
      <div className="flex flex-col gap-1.5">
        <h4 className="text-body-sm-medium text-accent-primary">
          {planName}
          {isInTrialPeriod && " trial"}
        </h4>
        <div className="text-caption-md-regular text-tertiary">{planDescription}</div>
      </div>
      {button && <div className="flex flex-col gap-1 items-center justify-center">{button}</div>}
    </div>
  );
});
