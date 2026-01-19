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

import type { FC } from "react";
//
import { cn } from "@plane/utils";

type TCountChip = {
  count: string | number;
  className?: string;
};

export function CountChip(props: TCountChip) {
  const { count, className = "" } = props;

  return (
    <div
      className={cn(
        "relative flex justify-center items-center px-2.5 py-0.5 flex-shrink-0 bg-accent-primary/20 text-accent-primary text-caption-sm-semibold rounded-xl",
        className
      )}
    >
      {count}
    </div>
  );
}
