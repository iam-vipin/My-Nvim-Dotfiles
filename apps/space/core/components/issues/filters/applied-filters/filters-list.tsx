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

import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { CloseIcon } from "@plane/propel/icons";
// types
import type { TFilters } from "@/types/issue";
// components
import { AppliedPriorityFilters } from "./priority";
import { AppliedStateFilters } from "./state";

type Props = {
  appliedFilters: TFilters;
  handleRemoveAllFilters: () => void;
  handleRemoveFilter: (key: keyof TFilters, value: string | null) => void;
};

export const replaceUnderscoreIfSnakeCase = (str: string) => str.replace(/_/g, " ");

export const AppliedFiltersList = observer(function AppliedFiltersList(props: Props) {
  const { appliedFilters = {}, handleRemoveAllFilters, handleRemoveFilter } = props;
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {Object.entries(appliedFilters).map(([key, value]) => {
        const filterKey = key as keyof TFilters;
        const filterValue = value as TFilters[keyof TFilters];

        if (!filterValue) return;

        return (
          <div
            key={filterKey}
            className="flex flex-wrap items-center gap-2 rounded-md border border-subtle px-2 py-1 capitalize"
          >
            <span className="text-11 text-tertiary">{replaceUnderscoreIfSnakeCase(filterKey)}</span>
            <div className="flex flex-wrap items-center gap-1">
              {filterKey === "priority" && (
                <AppliedPriorityFilters
                  handleRemove={(val) => handleRemoveFilter("priority", val)}
                  values={(filterValue ?? []) as TFilters["priority"]}
                />
              )}

              {filterKey === "state" && (
                <AppliedStateFilters
                  handleRemove={(val) => handleRemoveFilter("state", val)}
                  values={filterValue ?? []}
                />
              )}

              <button
                type="button"
                className="grid place-items-center text-tertiary hover:text-secondary"
                onClick={() => handleRemoveFilter(filterKey, null)}
              >
                <CloseIcon height={12} width={12} strokeWidth={2} />
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={handleRemoveAllFilters}
        className="flex items-center gap-2 rounded-md border border-subtle px-2 py-1 text-11 text-tertiary hover:text-secondary"
      >
        {t("common.clear_all")}
        <CloseIcon height={12} width={12} strokeWidth={2} />
      </button>
    </div>
  );
});
