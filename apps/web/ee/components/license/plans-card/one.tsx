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
import { NewTabIcon } from "@plane/propel/icons";
import { getButtonStyling } from "@plane/propel/button";
import { EProductSubscriptionEnum } from "@plane/types";
// plane imports
// helpers
import { cn } from "@plane/utils";
// plane web components
import { PlanCard, SelfManagedLicenseActions } from "@/plane-web/components/license";

export const OnePlanCard = observer(function OnePlanCard() {
  return (
    <PlanCard
      planVariant={EProductSubscriptionEnum.ONE}
      planDescription={
        <>
          <div className="text-body-xs-medium text-secondary">
            Active cycles, Time Tracking, Public View + Pages, ~50 Members
          </div>
          <SelfManagedLicenseActions />
        </>
      }
      button={
        <>
          <a
            href="https://prime.plane.so/"
            target="_blank"
            className={cn(
              getButtonStyling("primary", "lg"),
              "cursor-pointer px-3 py-1.5 text-center text-13 font-medium outline-none"
            )}
            rel="noreferrer"
          >
            {"Manage your license"}
            <NewTabIcon className="h-3 w-3" strokeWidth={2} />
          </a>
        </>
      }
    />
  );
});
