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

// plane imports
import { getButtonStyling } from "@plane/propel/button";
import { cn } from "@plane/utils";
// components
import { ProIcon } from "@/components/common/pro-icon";

export function IssueEmbedUpgradeCard(props: any) {
  return (
    <div
      className={cn(
        "w-full bg-layer-1 rounded-md border-[0.5px] border-subtle shadow-raised-100 flex items-center justify-between gap-5 px-5 py-2 max-md:flex-wrap",
        {
          "border-2": props.selected,
        }
      )}
    >
      <div className="flex items-center gap-4">
        <ProIcon className="flex-shrink-0 size-4" />
        <p className="text-secondary !text-14">
          Embed and access issues in pages seamlessly, upgrade to Plane Pro now.
        </p>
      </div>
      <a
        href="https://plane.so/pro"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(getButtonStyling("primary", "base"), "no-underline")}
      >
        Upgrade
      </a>
    </div>
  );
}
