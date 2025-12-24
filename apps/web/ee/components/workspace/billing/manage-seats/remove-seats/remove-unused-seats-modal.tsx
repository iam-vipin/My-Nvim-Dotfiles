import { useState } from "react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { IWorkspaceProductSubscription } from "@plane/types";
import { AlertModalCore } from "@plane/ui";
// plane web imports
import { PaymentService } from "@/plane-web/services/payment.service";
import { useWorkspace } from "@/hooks/store/use-workspace";

const paymentService = new PaymentService();

type TRemoveUnusedSeatsProps = {
  isOpen: boolean;
  handleClose: () => void;
  workspaceSlug: string;
  updateSubscribedPlan: (workspaceSlug: string, payload: Partial<IWorkspaceProductSubscription>) => void;
};

export function RemoveUnusedSeatsModal(props: TRemoveUnusedSeatsProps) {
  const { isOpen, handleClose, updateSubscribedPlan, workspaceSlug } = props;
  // states
  const [isSubmitting, setIsSubmitting] = useState(false);
  // store hooks
  const { mutateWorkspaceMembersActivity } = useWorkspace();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await paymentService.removeUnusedSeats(workspaceSlug?.toString());

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message: `Your workspace in now updated to ${response?.seats} seats.`,
      });
      updateSubscribedPlan(workspaceSlug, {
        purchased_seats: response?.seats,
      });
      void mutateWorkspaceMembersActivity(workspaceSlug);
      handleClose();
    } catch (err) {
      const errorMessage =
        err && typeof err === "object" && "error" in err && typeof err.error === "string" ? err.error : "Try again.";
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "We couldn't update seats.",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <AlertModalCore
      handleClose={handleClose}
      handleSubmit={() => void handleSubmit()}
      isSubmitting={isSubmitting}
      isOpen={isOpen}
      title="Remove unused seats?"
      content="If you are adding Admins or Members to this workspace so they can participate in projects, keep your seats instead of removing them. Remove them only if you are sure you don’t need to add anyone to your workspace."
      secondaryButtonText="Keep my seats"
      primaryButtonText={{
        loading: "Confirming",
        default: "Remove them",
      }}
    />
  );
}
