import type { ReactNode } from "react";
import { CloseIcon } from "@plane/propel/icons";
import { IconButton } from "@plane/propel/icon-button";

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
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
      <IconButton icon={CloseIcon} size="sm" onClick={onClear} variant={"ghost"} />
    </div>
  );
}
