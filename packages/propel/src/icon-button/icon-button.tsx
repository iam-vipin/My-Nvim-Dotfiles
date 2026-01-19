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

import * as React from "react";
import { cn } from "../utils";
import type { IconButtonProps } from "./helper";
import { iconButtonVariants } from "./helper";

const IconButton = React.forwardRef(function IconButton(
  props: IconButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const {
    variant = "primary",
    size = "base",
    className = "",
    type = "button",
    loading = false,
    disabled = false,
    icon: Icon,
    iconClassName = "",
    ...rest
  } = props;

  return (
    <button
      ref={ref}
      type={type}
      className={cn(iconButtonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...rest}
    >
      <Icon
        className={cn(
          {
            "size-3.5": size === "sm",
            "size-4": size === "base" || size === "lg",
            "size-5": size === "xl",
          },
          iconClassName
        )}
      />
    </button>
  );
});

IconButton.displayName = "plane-ui-icon-button";

export { IconButton };
