import { observer } from "mobx-react";
import { Button } from "@plane/propel/button";
import { ChevronDownIcon } from "@plane/propel/icons";
// plane imports
import { CustomMenu } from "@plane/ui";
// ce imports
import type { TBillingActionsButtonProps } from "@/ce/components/workspace/billing/billing-actions-button";
// plane web imports
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";
import { EProductSubscriptionEnum } from "@plane/types";

export const BillingActionsButton = observer(function BillingActionsButton(props: TBillingActionsButtonProps) {
  const { canPerformWorkspaceAdminActions } = props;
  // store hooks
  const {
    currentWorkspaceSubscribedPlanDetail: subscriptionDetail,
    isSeatManagementEnabled,
    toggleAddWorkspaceSeatsModal,
    toggleRemoveUnusedSeatsConfirmationModal,
  } = useWorkspaceSubscription();
  // derived values
  const isOnEnterprisePlan = subscriptionDetail?.product === EProductSubscriptionEnum.ENTERPRISE;

  if (!isSeatManagementEnabled || !canPerformWorkspaceAdminActions || isOnEnterprisePlan) return null;
  return (
    <CustomMenu
      customButton={
        <Button variant="secondary" size="lg" appendIcon={<ChevronDownIcon />}>
          Manage seats
        </Button>
      }
      placement="bottom-end"
      disabled={isOnEnterprisePlan}
      closeOnSelect
    >
      <CustomMenu.MenuItem
        onClick={() => {
          toggleAddWorkspaceSeatsModal({ isOpen: true });
        }}
      >
        Add seats
      </CustomMenu.MenuItem>
      <CustomMenu.MenuItem
        onClick={() => {
          toggleRemoveUnusedSeatsConfirmationModal();
        }}
      >
        Remove unused seats
      </CustomMenu.MenuItem>
    </CustomMenu>
  );
});
