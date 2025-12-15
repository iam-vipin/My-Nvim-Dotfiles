import { observer } from "mobx-react";
// plane imports
import { AlertTriangle } from "lucide-react";
import { Button } from "@plane/propel/button";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
import { cn } from "@plane/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
};

export const DiscardModal = observer(function DiscardModal(props: Props) {
  const { isOpen, onClose, onDiscard } = props;

  return (
    <ModalCore isOpen={isOpen} handleClose={() => onClose()} position={EModalPosition.CENTER} width={EModalWidth.XL}>
      <div className="p-4">
        <div className="flex gap-2 items-center mb-2">
          <span
            className={cn(
              "flex-shrink-0 grid place-items-center rounded-full size-12 sm:size-10 bg-danger-subtle text-danger"
            )}
          >
            <AlertTriangle className="size-5 text-danger-primary" aria-hidden="true" />
          </span>
          <h3 className="font-medium">Discard changes?</h3>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" size="lg" onClick={() => onClose()} id="discard-modal-button">
            Cancel
          </Button>
          <Button
            variant="error-fill"
            size="lg"
            onClick={() => {
              onDiscard();
              onClose();
            }}
            id="discard-modal-button"
          >
            Discard
          </Button>
        </div>
      </div>
    </ModalCore>
  );
});
