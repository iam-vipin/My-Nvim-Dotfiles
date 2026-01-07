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

// plane imports
import { observer } from "mobx-react";
import type { EProductSubscriptionEnum, TBillingFrequency } from "@plane/types";
import { calculateYearlyDiscount, cn } from "@plane/utils";

type TPlanFrequencyToggleProps = {
  subscriptionType: EProductSubscriptionEnum;
  monthlyPrice: number;
  yearlyPrice: number;
  selectedFrequency: TBillingFrequency;
  setSelectedFrequency: (frequency: TBillingFrequency) => void;
};

export const PlanFrequencyToggle = observer(function PlanFrequencyToggle(props: TPlanFrequencyToggleProps) {
  const { monthlyPrice, yearlyPrice, selectedFrequency, setSelectedFrequency } = props;
  // derived values
  const yearlyDiscount = calculateYearlyDiscount(monthlyPrice, yearlyPrice);

  return (
    <div className="flex w-full items-center cursor-pointer py-1">
      <div className="flex space-x-1 rounded-md bg-layer-3 p-0.5 w-full">
        <button
          type="button"
          onClick={() => setSelectedFrequency("month")}
          className={cn(
            "w-full rounded-sm px-1 py-0.5 text-caption-sm-medium leading-5 text-center",
            selectedFrequency === "month"
              ? "bg-layer-2 text-primary shadow-raised-100 border border-subtle-1"
              : "text-tertiary hover:text-secondary"
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setSelectedFrequency("year")}
          className={cn(
            "w-full rounded-sm px-1 py-0.5 text-caption-sm-medium leading-5 text-center",
            selectedFrequency === "year"
              ? "bg-layer-2 text-primary shadow-raised-100 border border-subtle-1"
              : "text-tertiary hover:text-secondary"
          )}
        >
          Yearly
          {yearlyDiscount > 0 && (
            <span className="bg-accent-primary text-on-color rounded-full px-1 py-0.5 ml-1.5 text-caption-xs-regular">
              -{yearlyDiscount}%
            </span>
          )}
        </button>
      </div>
    </div>
  );
});
