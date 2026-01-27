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
import type { TRowVariant } from "./helper";
import { ERowVariant, rowStyle } from "./helper";

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TRowVariant;
  className?: string;
  children: React.ReactNode;
}

const Row = React.forwardRef(function Row(props: RowProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const { variant = ERowVariant.REGULAR, className = "", children, ...rest } = props;

  const style = rowStyle[variant];

  return (
    <div ref={ref} className={cn(style, className)} {...rest}>
      {children}
    </div>
  );
});

Row.displayName = "plane-ui-row";

export { Row, ERowVariant };
