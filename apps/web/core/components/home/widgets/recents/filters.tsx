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
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { ChevronDownIcon } from "@plane/propel/icons";
import type { TRecentActivityFilterKeys } from "@plane/types";
import { CustomMenu } from "@plane/ui";
import { cn } from "@plane/utils";

export type TFiltersDropdown = {
  className?: string;
  activeFilter: TRecentActivityFilterKeys;
  setActiveFilter: (filter: TRecentActivityFilterKeys) => void;
  filters: { name: TRecentActivityFilterKeys; icon?: React.ReactNode; i18n_key: string }[];
};

export const FiltersDropdown = observer(function FiltersDropdown(props: TFiltersDropdown) {
  const { className, activeFilter, setActiveFilter, filters } = props;
  const { t } = useTranslation();

  function DropdownOptions() {
    return filters?.map((filter) => (
      <CustomMenu.MenuItem
        key={filter.name}
        className="flex items-center gap-2 truncate text-secondary"
        onClick={() => {
          setActiveFilter(filter.name);
        }}
      >
        <div className="truncate font-medium text-11 capitalize">{t(filter.i18n_key)}</div>
      </CustomMenu.MenuItem>
    ));
  }

  const title = activeFilter ? filters?.find((filter) => filter.name === activeFilter)?.i18n_key : "";
  return (
    <CustomMenu
      maxHeight={"md"}
      className={cn("flex justify-center text-11 text-secondary w-fit", className)}
      placement="bottom-start"
      customButton={
        <button className="flex hover:bg-layer-transparent-hover px-2 py-1 rounded-sm gap-1 capitalize border border-subtle">
          <span className="font-medium text-13 my-auto">{t(title || "")}</span>
          <ChevronDownIcon className={cn("size-3 my-auto text-tertiary hover:text-secondary duration-300")} />
        </button>
      }
      customButtonClassName="flex justify-center"
      closeOnSelect
    >
      <DropdownOptions />
    </CustomMenu>
  );
});
