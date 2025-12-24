import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "react-router";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { EProductSubscriptionEnum } from "@plane/types";
// plane web imports
import { AddSeatsModal } from "@/plane-web/components/workspace/billing/manage-seats/add-seats/modal";
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";

type Props = {
  additionalUserCount?: number;
  extraSeatRequired?: number;
};

export const AddSeatsAlertBanner = observer(function AddSeatsAlertBanner(props: Props) {
  const { additionalUserCount = 15, extraSeatRequired } = props;
  // router
  const { workspaceSlug } = useParams();
  // states
  const [addWorkspaceSeatsModal, setUpdateWorkspaceSeatsModal] = useState(false);
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const {
    currentWorkspaceSubscribedPlanDetail: subscribedPlan,
    currentWorkspaceSubscriptionAvailableSeats,
    getIsInTrialPeriod,
    togglePaidPlanModal,
    updateSubscribedPlan,
  } = useWorkspaceSubscription();
  // derived values
  const isFreePlan = subscribedPlan?.product === EProductSubscriptionEnum.FREE;

  const toggleAddWorkspaceSeatsModal = (flag: boolean) => {
    if (isFreePlan) {
      togglePaidPlanModal(flag);
    } else {
      setUpdateWorkspaceSeatsModal(flag);
    }
  };

  if (currentWorkspaceSubscriptionAvailableSeats && currentWorkspaceSubscriptionAvailableSeats >= additionalUserCount) {
    return <></>;
  }

  const addSeatMessagePaid = t("importers.add_seat_msg_paid", {
    additionalUserCount: additionalUserCount?.toString(),
    currentWorkspaceSubscriptionAvailableSeats: currentWorkspaceSubscriptionAvailableSeats?.toString(),
    extraSeatRequired: extraSeatRequired?.toString(),
  });
  const addSeatMessageFree = t("importers.add_seat_msg_free_trial", {
    additionalUserCount: additionalUserCount?.toString(),
    currentWorkspaceSubscriptionAvailableSeats: currentWorkspaceSubscriptionAvailableSeats?.toString(),
  });

  const alertMessage = isFreePlan ? addSeatMessageFree : addSeatMessagePaid;

  return (
    <div className="flex flex-row items-center gap-5 justify-between p-5 bg-red-500/20 rounded">
      <div className="font-normal text-13">{alertMessage}</div>
      <Button
        variant="primary"
        color="primary"
        onClick={() => {
          toggleAddWorkspaceSeatsModal(true);
        }}
      >
        {isFreePlan ? t("common.upgrade") : t("common.add_seats")}
      </Button>
      {workspaceSlug && subscribedPlan && (
        <AddSeatsModal
          data={{
            isOpen: addWorkspaceSeatsModal,
          }}
          getIsInTrialPeriod={getIsInTrialPeriod}
          subscribedPlan={subscribedPlan}
          updateSubscribedPlan={updateSubscribedPlan}
          workspaceSlug={workspaceSlug}
          onClose={() => {
            toggleAddWorkspaceSeatsModal(false);
          }}
        />
      )}
    </div>
  );
});
