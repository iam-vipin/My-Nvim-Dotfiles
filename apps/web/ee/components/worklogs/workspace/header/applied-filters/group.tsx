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
    <div className="relative flex items-center gap-2 p-1 px-2 rounded border border-custom-border-200">
      <div className="text-xs font-medium text-custom-text-200 capitalize">{groupTitle}</div>
      <div className="flex items-center gap-2">{children}</div>
      <div
        className="rounded flex-shrink-0 w-4 h-4 flex justify-center items-center cursor-pointer transition-all bg-custom-background-90 hover:bg-custom-background-100 text-custom-text-200 hover:text-custom-text-100"
        onClick={onClear}
      >
        <CloseIcon className="w-3 h-3" />
      </div>
    </div>
  );
}
