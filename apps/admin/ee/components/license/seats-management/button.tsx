import { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { Button } from "@plane/propel/button";
import { ChevronDownIcon } from "@plane/propel/icons";
import type { TProductSubscription, TProrationPreview } from "@plane/types";
import { CustomMenu } from "@plane/ui";
// local imports
import { AddSeatsModal } from "./add-seats/modal";
import { RemoveUnusedSeatsModal } from "./remove-seats/modal";

type TSeatsManagementButton = {
  fetchProrationPreviewService: (quantity: number) => Promise<TProrationPreview>;
  getIsInTrialPeriod: (checkForUpgrade: boolean) => boolean;
  removeUnusedSeatsService: () => Promise<{ seats: number }>;
  subscriptionDetail: TProductSubscription;
  subscriptionLevel: "workspace" | "instance";
  updateSeatsService: (quantity: number) => Promise<{ seats: number }>;
  updateSubscriptionDetail: (payload: Partial<TProductSubscription>) => void;
};

export const SeatsManagementButton = observer(function SeatsManagementButton(props: TSeatsManagementButton) {
  const {
    fetchProrationPreviewService,
    getIsInTrialPeriod,
    removeUnusedSeatsService,
    subscriptionDetail,
    subscriptionLevel,
    updateSeatsService,
    updateSubscriptionDetail,
  } = props;
  // states
  const [isAddSeatsModalOpen, setIsAddSeatsModalOpen] = useState(false);
  const [isRemoveUnusedSeatsConfirmationModalOpen, setIsRemoveUnusedSeatsConfirmationModalOpen] = useState(false);

  return (
    <>
      <AddSeatsModal
        fetchProrationPreviewService={fetchProrationPreviewService}
        getIsInTrialPeriod={getIsInTrialPeriod}
        isOpen={isAddSeatsModalOpen}
        onClose={() => setIsAddSeatsModalOpen(false)}
        subscriptionDetail={subscriptionDetail}
        subscriptionLevel={subscriptionLevel}
        updateSeatsService={updateSeatsService}
        updateSubscriptionDetail={updateSubscriptionDetail}
      />
      <RemoveUnusedSeatsModal
        handleClose={() => setIsRemoveUnusedSeatsConfirmationModalOpen(false)}
        isOpen={isRemoveUnusedSeatsConfirmationModalOpen}
        removeUnusedSeatsService={removeUnusedSeatsService}
        subscriptionLevel={subscriptionLevel}
        updateSubscriptionDetail={updateSubscriptionDetail}
      />
      <CustomMenu
        customButton={
          <Button variant="secondary" size="lg" appendIcon={<ChevronDownIcon />}>
            Manage seats
          </Button>
        }
        placement="bottom-end"
        closeOnSelect
      >
        <CustomMenu.MenuItem
          onClick={() => {
            setIsAddSeatsModalOpen(true);
          }}
        >
          Add seats
        </CustomMenu.MenuItem>
        <CustomMenu.MenuItem
          onClick={() => {
            setIsRemoveUnusedSeatsConfirmationModalOpen(true);
          }}
        >
          Remove unused seats
        </CustomMenu.MenuItem>
      </CustomMenu>
    </>
  );
});
