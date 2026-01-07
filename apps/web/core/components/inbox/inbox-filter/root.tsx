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
import { ListFilter } from "lucide-react";
import { getButtonStyling } from "@plane/propel/button";
// plane imports
import { ChevronDownIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
// components
import { FiltersDropdown } from "@/components/issues/issue-layouts/filters";
// hooks
import useSize from "@/hooks/use-window-size";
// local imports
import { InboxIssueFilterSelection } from "./filters/filter-selection";
import { InboxIssueOrderByDropdown } from "./sorting/order-by";

const smallButton = <ListFilter className="size-3 " />;

const largeButton = (
  <div className={cn(getButtonStyling("secondary", "base"), "px-2 text-tertiary")}>
    <ListFilter className="size-3 " />
    <span>Filters</span>
    <ChevronDownIcon className="size-3" strokeWidth={2} />
  </div>
);
export function FiltersRoot() {
  const windowSize = useSize();

  return (
    <div className="relative flex items-center gap-2">
      <div>
        <FiltersDropdown menuButton={windowSize[0] > 1280 ? largeButton : smallButton} title="" placement="bottom-end">
          <InboxIssueFilterSelection />
        </FiltersDropdown>
      </div>
      <div>
        <InboxIssueOrderByDropdown />
      </div>
    </div>
  );
}
