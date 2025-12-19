import React from "react";
import { observer } from "mobx-react";
// plane imports
import type { TAddWorkspaceSeatsModal } from "@plane/types";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
// local imports
import { AddSeatsForm } from "./form";

type TAddSeatsModalProps = {
  data: TAddWorkspaceSeatsModal;
  onClose: () => void;
};

export const AddSeatsModal = observer(function AddSeatsModal(props: TAddSeatsModalProps) {
  const { data, onClose } = props;
  const { isOpen } = data;

  if (!isOpen) return null;
  return (
    <ModalCore
      isOpen={isOpen}
      position={EModalPosition.TOP}
      width={EModalWidth.XXL}
      className="transition-all duration-300 ease-in-out"
    >
      <AddSeatsForm onClose={onClose} onSuccess={onClose} />
    </ModalCore>
  );
});
