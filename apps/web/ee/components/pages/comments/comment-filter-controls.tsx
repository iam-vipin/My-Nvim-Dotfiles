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
import { observer } from "mobx-react";
import { ListFilter } from "lucide-react";
import { CustomMenu, Checkbox } from "@plane/ui";

export type CommentFiltersProps = {
  filters: {
    showAll: boolean;
    showActive: boolean;
    showResolved: boolean;
  };
  onFilterChange: (filterKey: "showAll" | "showActive" | "showResolved") => void;
};

export const PageCommentFilterControls = observer(function PageCommentFilterControls({
  filters,
  onFilterChange,
}: CommentFiltersProps) {
  const isFiltersApplied = filters.showActive || filters.showResolved;

  return (
    <CustomMenu
      customButton={
        <div className="relative flex h-6 items-center border border-subtle-1 rounded-sm hover:border-subtle-1 transition-colors">
          <div className="flex h-6 px-2 items-center gap-1">
            <ListFilter className="size-3 text-tertiary" />
            <span className="text-tertiary text-11 font-medium leading-[14px]">Filters</span>
          </div>
          {isFiltersApplied && (
            <span className="absolute h-1.5 w-1.5 right-0 top-0 translate-x-1/2 -translate-y-1/2 bg-accent-primary rounded-full" />
          )}
        </div>
      }
      placement="bottom-end"
      closeOnSelect={false}
    >
      <CustomMenu.MenuItem onClick={() => onFilterChange("showActive")} className="flex items-center gap-2">
        <Checkbox id="show-active-main" checked={filters.showActive} className="size-3.5 border-strong-1" readOnly />
        <span className="text-13">Show active</span>
      </CustomMenu.MenuItem>
      <CustomMenu.MenuItem onClick={() => onFilterChange("showResolved")} className="flex items-center gap-2">
        <Checkbox
          id="show-resolved-main"
          checked={filters.showResolved}
          className="size-3.5 border-strong-1"
          readOnly
        />
        <span className="text-13">Show resolved</span>
      </CustomMenu.MenuItem>
      <CustomMenu.MenuItem onClick={() => onFilterChange("showAll")} className="flex items-center gap-2">
        <Checkbox id="show-all-main" checked={filters.showAll} className="size-3.5 border-strong-1" readOnly />
        <span className="text-13">Show all</span>
      </CustomMenu.MenuItem>
    </CustomMenu>
  );
});
