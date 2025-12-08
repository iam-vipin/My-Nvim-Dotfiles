import React, { useState } from "react";
import { Button } from "@plane/propel/button";
import { ModalCore, EModalWidth, EModalPosition } from "@plane/ui";
export type TExportProvider = "csv" | "xlsx" | "json";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (provider: TExportProvider) => void | Promise<void>;
  defaultProvider?: TExportProvider;
};

export function ExportModal(props: Props) {
  const { isOpen, onClose, onConfirm, defaultProvider = null } = props;
  const [provider, setProvider] = useState<TExportProvider | null>(defaultProvider);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!provider) return;
    setIsSubmitting(true);
    await onConfirm(provider);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose} width={EModalWidth.SM} position={EModalPosition.TOP}>
      <div className="p-5">
        <h3 className="text-base text-custom-text-100 font-medium mb-2">Export</h3>
        <div className="space-y-2">
          <p className="font-medium text-sm text-custom-text-200">Format</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="provider" checked={provider === "csv"} onChange={() => setProvider("csv")} />
            <span className="text-xs">CSV</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="provider" checked={provider === "json"} onChange={() => setProvider("json")} />
            <span className="text-xs">JSON</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-custom-border-200 p-3">
        <Button variant="neutral-primary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleConfirm} disabled={!provider || isSubmitting}>
          Continue
        </Button>
      </div>
    </ModalCore>
  );
}
