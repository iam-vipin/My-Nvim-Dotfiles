import { useState } from "react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
// ui
import { AlertModalCore } from "@plane/ui";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web hooks
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";
// plane web services
import { PaymentService } from "@/plane-web/services/payment.service";

const paymentService = new PaymentService();

type TRemoveUnusedSeatsProps = {
  isOpen: boolean;
  handleClose: () => void;
  workspaceSlug: string;
};

export function RemoveUnusedSeatsModal(props: TRemoveUnusedSeatsProps) {
  const { isOpen, handleClose, workspaceSlug } = props;
  // mobx store
  const { updateSubscribedPlan } = useWorkspaceSubscription();
  const { mutateWorkspaceMembersActivity } = useWorkspace();
  // states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await paymentService.removeUnusedSeats(workspaceSlug?.toString());

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message: `Your workspace in now updated to ${response?.seats} seats.`,
      });
      updateSubscribedPlan(workspaceSlug?.toString(), {
        purchased_seats: response?.seats,
      });
      void mutateWorkspaceMembersActivity(workspaceSlug);
      handleClose();
    } catch (err: unknown) {
      const error = err as { error?: string };
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "We couldn't update seats.",
        message: error?.error || "Try again.",
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
