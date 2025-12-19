import type { FC } from "react";
import React from "react";
// utils
import { cn } from "@plane/utils";

type TSectionWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionWrapper(props: TSectionWrapperProps) {
  const { children, className = "" } = props;
  return (
    <div className={cn(`flex flex-col gap-4 w-full py-6 first:pt-0 border-b border-subtle last:border-0`, className)}>
      {children}
    </div>
  );
}
