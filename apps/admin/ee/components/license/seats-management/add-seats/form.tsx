import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { TProductSubscription, TProrationPreview } from "@plane/types";
import { getSubscriptionName } from "@plane/utils";
// plane web imports
import { SelectSeatsStep, ConfirmPriceStep } from "./steps";

// Step type to track the modal state
type TModalStep = "SELECT_SEATS" | "CONFIRM_PRICE";

export type TMangeSeatSubscriptionDetails = Pick<
  TProductSubscription,
  "purchased_seats" | "is_self_managed" | "product"
>;

type TAddSeatsFormProps = {
  fetchProrationPreviewService: (quantity: number) => Promise<TProrationPreview>;
  getIsInTrialPeriod: (checkForUpgrade: boolean) => boolean;
  onClose?: () => void;
  onPreviousStep?: () => void;
  onSuccess?: () => void;
  subscriptionDetail: TMangeSeatSubscriptionDetails;
  subscriptionLevel: "workspace" | "instance";
  updateSeatsService: (quantity: number) => Promise<{ seats: number }>;
  updateSubscriptionDetail: (payload: Partial<TProductSubscription>) => void;
};

export const AddSeatsForm = observer(function AddSeatsForm(props: TAddSeatsFormProps) {
  const {
    fetchProrationPreviewService,
    getIsInTrialPeriod,
    onClose,
    onPreviousStep,
    onSuccess,
    subscriptionDetail,
    subscriptionLevel,
    updateSeatsService,
    updateSubscriptionDetail,
  } = props;
  // states
  const [currentStep, setCurrentStep] = useState<TModalStep>("SELECT_SEATS");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetchingProrationPreview, setIsFetchingProrationPreview] = useState<boolean>(false);
  const [numberOfSeats, setNumberOfSeats] = useState<string>("1");
  const [prorationPreview, setProrationPreview] = useState<TProrationPreview | null>(null);
  const [error, setError] = useState<string>("");
  // derived values
  const isSelfHosted = subscriptionDetail?.is_self_managed;
  const isOnTrial = getIsInTrialPeriod(false);
  const planeName = subscriptionDetail?.product ? getSubscriptionName(subscriptionDetail?.product) : "";

  useEffect(() => {
    if (error) setError("");
  }, [error, numberOfSeats]);

  // handlers
  const resetForm = () => {
    const timeout = setTimeout(() => {
      setNumberOfSeats("1");
      setError("");
      setProrationPreview(null);
      setCurrentStep("SELECT_SEATS");
      clearTimeout(timeout);
    }, 350);
  };

  const handleClose = () => {
    onClose?.();
    resetForm();
  };

  const handleOnPreviousStep = () => {
    onPreviousStep?.();
    resetForm();
  };

  const fetchProrationPreview = async () => {
    const numberOfSeatsToAdd = Number(numberOfSeats);
    if (isNaN(numberOfSeatsToAdd) || numberOfSeatsToAdd <= 0) return;

    setIsFetchingProrationPreview(true);
    try {
      const response = await fetchProrationPreviewService(numberOfSeatsToAdd);
      setProrationPreview(response);
      setCurrentStep("CONFIRM_PRICE");
    } catch (error) {
      console.error("AddSeatsForm -> fetchProrationPreview -> error", error);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error fetching price",
        message: "Try again.",
      });
    } finally {
      setIsFetchingProrationPreview(false);
    }
  };

  const handleNextStep = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validate purchased seats
    if (!subscriptionDetail?.purchased_seats) return;
    // validate number of seats
    if (!numberOfSeats || Number(numberOfSeats) <= 0) {
      setError("You need to add at least one seat.");
      return;
    }
    if (isNaN(Number(numberOfSeats)) || Number(numberOfSeats) > 10000) {
      setError("We take a number from 1 to 10,000 here.");
      return;
    }
    // If the subscription is on trial, we don't need to fetch the proration preview
    if (isOnTrial) {
      await handleFormSubmit(e);
    } else {
      await fetchProrationPreview();
    }
  };

  const handleFormSubmit = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validate purchased seats
    if (!subscriptionDetail?.purchased_seats) return;

    const purchasedSeats = subscriptionDetail?.purchased_seats;
    const updatedSeats = purchasedSeats + Number(numberOfSeats);

    setIsSubmitting(true);
    try {
      const response = await updateSeatsService(updatedSeats);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Congratulations.",
        message: `${subscriptionLevel === "instance" ? `Your instance is now updated to ${response?.seats} seats.` : `Your workspace is now updated to ${response?.seats} seats.`}`,
      });
      updateSubscriptionDetail({ purchased_seats: response?.seats });
      onSuccess?.();
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

  const handleSeatChange = (action: "increase" | "decrease") => {
    if (isNaN(Number(numberOfSeats))) {
      setNumberOfSeats("1");
      return;
    }
    if (action === "increase") {
      setNumberOfSeats((prev) => {
        const newSeats = Number(prev) + 1;
        return newSeats > 10000 ? "10000" : newSeats.toString();
      });
    } else {
      setNumberOfSeats((prev) => {
        const newSeats = Number(prev) - 1;
        return newSeats < 1 ? "1" : newSeats.toString();
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (currentStep === "SELECT_SEATS") void handleNextStep(e);
        else void handleFormSubmit(e);
      }}
    >
      {currentStep === "SELECT_SEATS" ? (
        <SelectSeatsStep
          error={error}
          handleClose={handleClose}
          handleNextStep={(e) => void handleNextStep(e)}
          handleSeatChange={handleSeatChange}
          isLoading={isOnTrial ? isSubmitting : isFetchingProrationPreview}
          isOnTrial={isOnTrial}
          isSelfHosted={!!isSelfHosted}
          numberOfSeats={numberOfSeats}
          onPreviousStep={onPreviousStep ? handleOnPreviousStep : undefined}
          planeName={planeName}
          purchasedSeats={subscriptionDetail?.purchased_seats || 0}
          setError={setError}
          setNumberOfSeats={setNumberOfSeats}
          subscriptionLevel={subscriptionLevel}
        />
      ) : (
        prorationPreview && (
          <ConfirmPriceStep
            handleClose={handleClose}
            handleFormSubmit={(e) => void handleFormSubmit(e)}
            isSubmitting={isSubmitting}
            onPreviousStep={() => setCurrentStep("SELECT_SEATS")}
            prorationPreview={prorationPreview}
            subscriptionLevel={subscriptionLevel}
          />
        )
      )}
    </form>
  );
});
