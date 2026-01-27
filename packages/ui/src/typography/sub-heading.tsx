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

import React from "react";
import { cn } from "../utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  noMargin?: boolean;
};

function SubHeading({ children, className, noMargin }: Props) {
  return (
    <h3 className={cn("text-18 font-medium text-secondary block leading-7", !noMargin && "mb-2", className)}>
      {children}
    </h3>
  );
}

export { SubHeading };
