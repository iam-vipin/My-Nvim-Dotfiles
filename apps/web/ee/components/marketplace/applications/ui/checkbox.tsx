import React from "react";
import { cn } from "@plane/utils";

interface CustomCheckboxProps {
  label: string;
  checked: boolean;
  className?: string;
  onChange: (value: boolean) => void;
}

export function CustomCheckbox({ label, checked, className = "", onChange }: CustomCheckboxProps) {
  const handleClick = (value: boolean) => {
    onChange(value);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="inline-flex items-center gap-2 cursor-pointer" onClick={() => handleClick(!checked)}>
        <div
          className={cn(
            "flex-shrink-0 w-4 h-4 p-1 relative flex justify-center items-center border border-subtle-1 overflow-hidden rounded-sm transition-all",
            { "border-accent-strong": checked }
          )}
        >
          <div
            className={cn("w-full h-full bg-layer-1 transition-all", {
              "bg-accent-primary": checked,
            })}
          />
        </div>
        <div className="text-13 text-tertiary">{label}</div>
      </div>
    </div>
  );
}
