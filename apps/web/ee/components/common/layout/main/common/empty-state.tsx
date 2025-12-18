import type { FC } from "react";
import React from "react";
// plane imports
import { cn } from "@plane/utils";

type TSectionEmptyStateProps = {
  heading: string;
  subHeading: string;
  icon: React.ReactNode;
  actionElement?: React.ReactNode;
  variant?: "outline" | "solid";
  iconVariant?: "square" | "round";
  size?: "sm" | "md";
  containerClassName?: string;
  contentClassName?: string;
};

export function SectionEmptyState(props: TSectionEmptyStateProps) {
  const {
    heading,
    subHeading,
    icon,
    actionElement,
    variant = "outline",
    iconVariant = "square",
    size = "sm",
    containerClassName,
    contentClassName,
  } = props;
  return (
    <div
      className={cn(
        "flex flex-col gap-4 items-center justify-center rounded-md px-10",
        {
          "border border-subtle": variant === "outline",
          "bg-layer-1/70": variant === "solid",
          "py-10": size === "sm",
          "py-12": size === "md",
        },
        containerClassName
      )}
    >
      <div className={cn("flex flex-col items-center gap-2 text-center", contentClassName)}>
        <div
          className={cn("flex items-center justify-center bg-layer-1", {
            "rounded-full": iconVariant === "round",
            rounded: iconVariant === "square",
            "size-8": size === "sm",
            "size-12": size === "md",
          })}
        >
          {icon}
        </div>
        <span
          className={cn("font-medium", {
            "text-13 ": size === "sm",
            "text-14": size === "md",
          })}
        >
          {heading}
        </span>
        <span
          className={cn("text-tertiary", {
            "text-11": size === "sm",
            "text-13": size === "md",
          })}
        >
          {subHeading}
        </span>
      </div>
      {actionElement && <>{actionElement}</>}
    </div>
  );
}
