import { observer } from "mobx-react";
// plane imports
import type { TProductSubscription, TProrationPreview } from "@plane/types";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
// local imports
import { AddSeatsForm } from "./form";
import type { TMangeSeatSubscriptionDetails } from "./form";

type TAddSeatsModalProps = {
  fetchProrationPreviewService: (quantity: number) => Promise<TProrationPreview>;
  getIsInTrialPeriod: (checkForUpgrade: boolean) => boolean;
  isOpen: boolean;
  onClose: () => void;
  subscriptionDetail: TMangeSeatSubscriptionDetails;
  subscriptionLevel: "workspace" | "instance";
  updateSeatsService: (quantity: number) => Promise<{ seats: number }>;
  updateSubscriptionDetail: (payload: Partial<TProductSubscription>) => void;
};

export const AddSeatsModal = observer(function AddSeatsModal(props: TAddSeatsModalProps) {
  const { isOpen } = props;

  if (!isOpen) return null;
  return (
    <ModalCore
      isOpen={isOpen}
      position={EModalPosition.TOP}
      width={EModalWidth.XXL}
      className="transition-all duration-300 ease-in-out"
    >
      <AddSeatsForm {...props} />
    </ModalCore>
  );
});
