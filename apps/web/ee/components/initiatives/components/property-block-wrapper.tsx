import type { FC } from "react";
import React from "react";
// plane imports
import { cn } from "@plane/utils";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function PropertyBlockWrapper(props: Props) {
  const { className = "", children } = props;
  return (
    <div className="h-6">
      <div className={cn("h-full text-11 flex items-center gap-2", className)}>{children}</div>
    </div>
  );
}
