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

import type { ReactNode } from "react";
import { cn } from "@plane/utils";

type Props = {
  children: ReactNode;
  gradient?: boolean;
  className?: string;
};

function DefaultLayout({ children, gradient = false, className }: Props) {
  return (
    <div className={cn(`h-screen w-full overflow-hidden ${gradient ? "" : "bg-surface-1"}`, className)}>{children}</div>
  );
}

export default DefaultLayout;
