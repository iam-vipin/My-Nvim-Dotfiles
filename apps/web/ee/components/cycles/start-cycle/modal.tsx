import React from "react";
import { Button } from "@plane/propel/button";
import { EModalWidth, ModalCore } from "@plane/ui";

interface Props {
  handleStartCycle: () => void;
  isOpen: boolean;
  handleClose: () => void;
  loading: boolean;
}

export function StartCycleModal(props: Props) {
  const { isOpen, handleClose, handleStartCycle, loading } = props;
  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose} width={EModalWidth.MD}>
      <div className="p-4">
        <h3 className="text-16 font-medium">Sure you want to start this cycle?</h3>
        {/* <p className="text-13 text-tertiary mt-1"></p> */}
        <div className="mt-2 pt-2 flex items-center justify-end gap-2 border-t-[0.5px] border-subtle-1">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!!loading} onClick={handleStartCycle}>
            {loading ? "Starting..." : "Start Cycle"}
          </Button>
        </div>
      </div>
    </ModalCore>
  );
}
