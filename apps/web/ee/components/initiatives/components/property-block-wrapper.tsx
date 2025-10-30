"use client";

import type { FC } from "react";
import React from "react";
// plane imports
import { cn } from "@plane/utils";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export const PropertyBlockWrapper: FC<Props> = (props) => {
  const { className = "", children } = props;
  return (
    <div className="h-6">
      <div className={cn("h-full text-xs flex items-center gap-2", className)}>{children}</div>
    </div>
  );
};
