import { useState } from "react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { TProductSubscription } from "@plane/types";
import { AlertModalCore } from "@plane/ui";

type TRemoveUnusedSeatsProps = {
  handleClose: () => void;
  isOpen: boolean;
  removeUnusedSeatsService: () => Promise<{ seats: number }>;
  updateSubscriptionDetail: (payload: Partial<TProductSubscription>) => void;
  subscriptionLevel: "workspace" | "instance";
};

export function RemoveUnusedSeatsModal(props: TRemoveUnusedSeatsProps) {
  const { handleClose, isOpen, removeUnusedSeatsService, updateSubscriptionDetail, subscriptionLevel } = props;
  // states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await removeUnusedSeatsService();
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message:
          subscriptionLevel === "instance"
            ? `Your instance in now updated to ${response?.seats} seats.`
            : `Your workspace in now updated to ${response?.seats} seats.`,
      });
      updateSubscriptionDetail({
        purchased_seats: response?.seats,
      });
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
      content={
        subscriptionLevel === "instance"
          ? "If you are adding Admins or Members to this instance so they can participate in projects, keep your seats instead of removing them. Remove them only if you are sure you don’t need to add anyone to your instance."
          : "If you are adding Admins or Members to this workspace so they can participate in projects, keep your seats instead of removing them. Remove them only if you are sure you don’t need to add anyone to your workspace."
      }
      secondaryButtonText="Keep my seats"
      primaryButtonText={{
        loading: "Confirming",
        default: "Remove them",
      }}
    />
  );
}
