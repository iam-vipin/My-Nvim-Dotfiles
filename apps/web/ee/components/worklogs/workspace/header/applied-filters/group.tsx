import type { FC, ReactNode } from "react";
import { CloseIcon } from "@plane/propel/icons";

type TAppliedFilterGroup = {
  groupTitle: string;
  onClear: () => void;
  children: ReactNode;
};

export function AppliedFilterGroup(props: TAppliedFilterGroup) {
  const { groupTitle, onClear, children } = props;

  return (
    <div className="relative flex items-center gap-2 p-1 px-2 rounded-sm border border-subtle-1">
      <div className="text-11 font-medium text-secondary capitalize">{groupTitle}</div>
      <div className="flex items-center gap-2">{children}</div>
      <div
        className="rounded-sm flex-shrink-0 w-4 h-4 flex justify-center items-center cursor-pointer transition-all bg-layer-1 hover:bg-surface-1 text-secondary hover:text-primary"
        onClick={onClear}
      >
        <CloseIcon className="w-3 h-3" />
      </div>
    </div>
  );
}
