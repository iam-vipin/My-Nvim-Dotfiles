/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type React from "react";

export const iconButtonVariants = cva(
  "inline-flex items-center justify-center gap-1 aspect-square whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-primary hover:bg-accent-primary-hover active:bg-accent-primary-active focus-visible:bg-accent-primary-active disabled:bg-layer-disabled text-on-color disabled:text-on-color-disabled",
        "error-fill":
          "bg-danger-primary hover:bg-danger-primary-hover active:bg-danger-primary-active focus-visible:bg-danger-primary-active disabled:bg-layer-disabled text-on-color disabled:text-disabled",
        "error-outline":
          "bg-layer-2 hover:bg-danger-subtle active:bg-danger-subtle-hover focus-visible:bg-danger-subtle-hover disabled:bg-layer-2 text-danger-primary disabled:text-disabled border border-danger-strong disabled:border-subtle-1",
        secondary:
          "bg-layer-2 hover:bg-layer-2-hover active:bg-layer-2-active focus-visible:bg-layer-2-active disabled:bg-layer-transparent text-secondary disabled:text-disabled border border-strong disabled:border-subtle-1 shadow-raised-100",
        tertiary:
          "bg-layer-3 hover:bg-layer-3-hover active:bg-layer-3-active focus-visible:bg-layer-3-active disabled:bg-layer-transparent text-secondary disabled:text-disabled",
        ghost:
          "bg-layer-transparent hover:bg-layer-transparent-hover active:bg-layer-transparent-active focus-visible:bg-layer-transparent-active disabled:bg-layer-transparent text-secondary disabled:text-disabled",
      },
      size: {
        sm: "size-5 rounded-sm",
        base: "size-6 rounded-md",
        lg: "size-7 rounded-md",
        xl: "size-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "base",
    },
  }
);

type IconButtonPropsWithChildren = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof iconButtonVariants> & {
    icon: React.FC<{ className?: string }>;
    loading?: boolean;
    iconClassName?: string;
  };
export type IconButtonProps = Omit<IconButtonPropsWithChildren, "children">;

export function getIconButtonStyling(
  variant: NonNullable<IconButtonProps["variant"]>,
  size: NonNullable<IconButtonProps["size"]>
): string {
  return iconButtonVariants({ variant, size });
}
