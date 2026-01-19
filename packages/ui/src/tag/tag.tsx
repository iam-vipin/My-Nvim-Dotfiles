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
import type { TTagSize, TTagVariant } from "./helper";
import { ETagSize, ETagVariant, getTagStyle } from "./helper";

export interface TagProps extends React.ComponentProps<"div"> {
  variant?: TTagVariant;
  size?: TTagSize;
  className?: string;
  children: React.ReactNode;
}

const Tag = React.forwardRef(function Tag(props: TagProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const { variant = ETagVariant.OUTLINED, className = "", size = ETagSize.SM, children, ...rest } = props;

  const style = getTagStyle(variant, size);
  return (
    <div ref={ref} className={cn(style, className)} {...rest}>
      {children}
    </div>
  );
});

Tag.displayName = "plane-ui-container";

export { Tag, ETagVariant, ETagSize };
