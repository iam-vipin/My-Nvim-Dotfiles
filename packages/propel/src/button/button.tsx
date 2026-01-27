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
import type { ButtonProps } from "./helper";
import { getIconStyling, buttonVariants } from "./helper";

const Button = React.forwardRef(function Button(props: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) {
  const {
    variant = "primary",
    size = "base",
    className = "",
    type = "button",
    loading = false,
    disabled = false,
    prependIcon = null,
    appendIcon = null,
    children,
    ...rest
  } = props;

  const buttonIconStyle = getIconStyling(size ?? "base");

  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...rest}
    >
      {prependIcon && React.cloneElement(prependIcon, { className: cn("shrink-0", buttonIconStyle), strokeWidth: 2 })}
      {children}
      {appendIcon && React.cloneElement(appendIcon, { className: cn("shrink-0", buttonIconStyle), strokeWidth: 2 })}
    </button>
  );
});

Button.displayName = "plane-ui-button";

export { Button };
