import { observer } from "mobx-react";
import { EProductSubscriptionEnum } from "@plane/types";
// helpers
import { renderFormattedDate } from "@plane/utils";
// plane web imports
import { PlanCard } from "@/plane-web/components/license";
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";

export const EnterprisePlanCard = observer(function EnterprisePlanCard() {
  // hooks
  const { currentWorkspaceSubscribedPlanDetail: subscriptionDetail } = useWorkspaceSubscription();
  // derived values
  const startDate = subscriptionDetail?.current_period_start_date;
  const endDate = subscriptionDetail?.current_period_end_date;
  const isSubscriptionCancelled = subscriptionDetail?.is_cancelled;

  if (!subscriptionDetail) return null;
  return (
    <PlanCard
      planVariant={EProductSubscriptionEnum.ENTERPRISE}
      planDescription={
        <>
          <div className="text-body-xs-medium text-secondary">
            Unlimited members, Unlimited Guests, Custom Workflows, Advanced Analytics, and more
          </div>
          {!subscriptionDetail.is_offline_payment ? (
            <>
              {isSubscriptionCancelled ? (
                <div className="text-body-xs-medium text-danger-secondary">
                  Your billing cycle ends on {renderFormattedDate(endDate)}.
                </div>
              ) : (
                <div className="text-body-xs-medium text-secondary">
                  {startDate
                    ? `Current billing cycle: ${renderFormattedDate(startDate)} - ${renderFormattedDate(endDate)}`
                    : `Your billing cycle renews on ${renderFormattedDate(endDate)}`}{" "}
                  • Billable seats: {subscriptionDetail?.purchased_seats}
                </div>
              )}
              <div className="text-body-xs-medium text-secondary">
                To manage your subscription or seats, please contact your instance admin.
              </div>
            </>
          ) : (
            <div className="text-body-xs-medium text-secondary">
              To manage your subscription, please{" "}
              <a className="text-accent-primary hover:underline" href="mailto:support@plane.so">
                contact support.
              </a>
            </div>
          )}
        </>
      }
    />
  );
});
