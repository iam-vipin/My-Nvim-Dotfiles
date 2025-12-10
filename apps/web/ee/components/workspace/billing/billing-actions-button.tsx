import { observer } from "mobx-react";
import { Button } from "@plane/propel/button";
import { ChevronDownIcon } from "@plane/propel/icons";
// plane imports
import { CustomMenu } from "@plane/ui";
// ce imports
import type { TBillingActionsButtonProps } from "@/ce/components/workspace/billing/billing-actions-button";
// plane web imports
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";

export const BillingActionsButton = observer(function BillingActionsButton(props: TBillingActionsButtonProps) {
  const { canPerformWorkspaceAdminActions } = props;
  // store hooks
  const { isSeatManagementEnabled, toggleAddWorkspaceSeatsModal, toggleRemoveUnusedSeatsConfirmationModal } =
    useWorkspaceSubscription();

  return (
    <>
      {isSeatManagementEnabled && canPerformWorkspaceAdminActions && (
        <CustomMenu
          customButton={
            <Button variant="neutral-primary" size="sm" className="flex items-center justify-center gap-1">
              Manage seats
              <ChevronDownIcon className="h-3 w-3" />
            </Button>
          }
          placement="bottom-end"
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
      )}
    </>
  );
});
