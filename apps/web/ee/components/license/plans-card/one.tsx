import { observer } from "mobx-react";
import { ExternalLink } from "lucide-react";
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
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
          </a>
        </>
      }
    />
  );
});
