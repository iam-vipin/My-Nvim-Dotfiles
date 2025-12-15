import React from "react";
// plane imports
import { cn } from "@plane/utils";

type TProps = {
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
};

export function AutomationDetailsMainContentBlockWrapper(props: TProps) {
  const { children, isSelected, onClick } = props;

  return (
    <div
      className={cn("flex-grow p-4 space-y-2 bg-layer-2 rounded-lg shadow-custom-shadow-2xs border shadow-raised-100", {
        "border-accent-strong": isSelected,
        "border-subtle": !isSelected,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
