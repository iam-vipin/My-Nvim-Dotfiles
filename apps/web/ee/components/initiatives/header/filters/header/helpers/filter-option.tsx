import React from "react";
// lucide icons
import { CheckIcon } from "@plane/propel/icons";

type Props = {
  icon?: React.ReactNode;
  isChecked: boolean;
  title: React.ReactNode;
  onClick?: () => void;
  multiple?: boolean;
  activePulse?: boolean;
};

export function FilterOption(props: Props) {
  const { icon, isChecked, multiple = true, onClick, title, activePulse = false } = props;

  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded p-1.5 hover:bg-layer-1-hover"
      onClick={onClick}
    >
      <div
        className={`grid h-3 w-3 flex-shrink-0 place-items-center border bg-layer-1 ${
          isChecked ? "border-accent-strong bg-accent-primary text-white" : "border-subtle-1"
        } ${multiple ? "rounded-sm" : "rounded-full"}`}
      >
        {isChecked && <CheckIcon width={10} height={10} strokeWidth={3} />}
      </div>
      <div className="flex items-center gap-2 truncate">
        {icon && <div className="grid w-5 flex-shrink-0 place-items-center">{icon}</div>}
        <div className="flex-grow truncate text-11 text-secondary">{title}</div>
      </div>
      {activePulse && (
        <div className="flex-shrink-0 text-11 w-2 h-2 rounded-full bg-accent-primary animate-pulse ml-auto" />
      )}
    </button>
  );
}
