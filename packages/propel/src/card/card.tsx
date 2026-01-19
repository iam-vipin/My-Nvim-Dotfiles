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
import { cn } from "../utils/classname";
import type { TCardDirection, TCardSpacing, TCardVariant } from "./helper";
import { ECardDirection, ECardSpacing, ECardVariant, getCardStyle } from "./helper";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TCardVariant;
  spacing?: TCardSpacing;
  direction?: TCardDirection;
  className?: string;
  children: React.ReactNode;
}

const Card = React.forwardRef(function Card(props: CardProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    variant = ECardVariant.WITH_SHADOW,
    direction = ECardDirection.COLUMN,
    className = "",
    spacing = ECardSpacing.LG,
    children,
    ...rest
  } = props;

  const style = getCardStyle(variant, spacing, direction);
  return (
    <div ref={ref} className={cn(style, className)} {...rest}>
      {children}
    </div>
  );
});

Card.displayName = "plane-ui-card";

export { Card, ECardVariant, ECardSpacing, ECardDirection };
