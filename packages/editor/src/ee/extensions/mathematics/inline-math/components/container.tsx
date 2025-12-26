import React from "react";
import { cn } from "@plane/utils";
// types
import type { MathNodeVariant, TMathComponentProps } from "../../types";

type TInlineMathContainerProps = TMathComponentProps & {
  children: React.ReactNode;
  variant?: MathNodeVariant;
  className?: string;
  title?: string;
  isEditable?: boolean;
};

export function InlineMathContainer({
  onClick,
  children,
  variant = "content",
  className,
  title,
  isEditable = true,
}: TInlineMathContainerProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-1 px-2 h-6 rounded-sm transition-colors overflow-hidden leading-none";

  const variantClasses = {
    empty: `bg-layer-1 text-tertiary ${isEditable ? "hover:bg-layer-1-hover hover:text-secondary cursor-pointer" : "cursor-default"}`,
    error: `bg-danger-primary text-danger-primary ${isEditable ? "hover:bg-danger-primary cursor-pointer" : "cursor-default"}`,
    content: `${isEditable ? "hover:bg-layer-1-hover cursor-pointer" : "cursor-default"}`,
  };

  return (
    <span
      className={cn(baseClasses, variantClasses[variant], className)}
      onMouseDown={onClick}
      title={title}
      {...(isEditable && { role: "button" })}
    >
      {children}
    </span>
  );
}
