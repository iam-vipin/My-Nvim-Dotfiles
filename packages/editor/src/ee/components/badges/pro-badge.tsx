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

interface ProBadgeProps {
  className?: string;
}

export function ProBadge({ className }: ProBadgeProps): ReactNode {
  return (
    <div
      className={cn(
        "w-fit rounded text-center text-caption-md-medium px-2 py-0.5 shrink-0 bg-plans-brand-subtle text-plans-brand-primary",
        className
      )}
    >
      Pro
    </div>
  );
}
