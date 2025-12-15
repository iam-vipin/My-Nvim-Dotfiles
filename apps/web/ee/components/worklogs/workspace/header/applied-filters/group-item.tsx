import type { FC, ReactNode } from "react";
import { CloseIcon } from "@plane/propel/icons";

type TAppliedFilterGroupItem = {
  onClear?: () => void;
  children: ReactNode;
};

export function AppliedFilterGroupItem(props: TAppliedFilterGroupItem) {
  const { children, onClear } = props;

  return (
    <div className="flex items-center gap-2 border border-subtle-1 rounded-sm p-1">
      {children}
      {onClear && (
        <div
          className="rounded-sm flex-shrink-0 w-4 h-4 flex justify-center items-center cursor-pointer transition-all bg-layer-1 hover:bg-surface-1 text-secondary hover:text-primary"
          onClick={onClear}
        >
          <CloseIcon className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
