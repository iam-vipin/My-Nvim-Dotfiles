import React from "react";
import { cn } from "@plane/utils";

type InitiativeLabelNameProps = {
  name: string;
  color: string;
  className?: string;
};

export function InitiativeLabelName(props: InitiativeLabelNameProps) {
  const { name, color, className = "" } = props;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />
      <span className="text-sm font-medium text-custom-text-100">{name}</span>
    </div>
  );
}
