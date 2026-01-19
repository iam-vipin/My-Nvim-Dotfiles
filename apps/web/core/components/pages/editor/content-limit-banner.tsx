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

import { TriangleAlert } from "lucide-react";
import { cn } from "@plane/utils";

type Props = {
  className?: string;
  onDismiss?: () => void;
};

export function ContentLimitBanner({ className, onDismiss }: Props) {
  return (
    <div className={cn("flex items-center gap-2 bg-layer-2 border-b border-subtle-1 px-4 py-2.5 text-13", className)}>
      <div className="flex items-center gap-2 text-secondary mx-auto">
        <TriangleAlert className="shrink-0 size-4" />
        <p className="font-medium">
          Content limit reached and live sync is off. Create a new page or use nested pages to continue syncing.
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto text-placeholder hover:text-secondary"
          aria-label="Dismiss content limit warning"
        >
          ✕
        </button>
      )}
    </div>
  );
}
