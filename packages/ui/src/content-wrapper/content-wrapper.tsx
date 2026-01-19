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
import { Row } from "../row";
import type { TRowVariant } from "../row/helper";
import { ERowVariant } from "../row/helper";
import { cn } from "../utils";

export interface ContentWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TRowVariant;
  className?: string;
  children: React.ReactNode;
}
const DEFAULT_STYLE = "flex flex-col vertical-scrollbar scrollbar-lg h-full w-full overflow-y-auto";

const ContentWrapper = React.forwardRef(function ContentWrapper(
  props: ContentWrapperProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { variant = ERowVariant.REGULAR, className = "", children, ...rest } = props;

  return (
    <Row
      ref={ref}
      variant={variant}
      className={cn(
        DEFAULT_STYLE,
        {
          "py-page-y": variant === ERowVariant.REGULAR,
        },
        className
      )}
      {...rest}
    >
      {children}
    </Row>
  );
});

ContentWrapper.displayName = "plane-ui-wrapper";

export { ContentWrapper };
