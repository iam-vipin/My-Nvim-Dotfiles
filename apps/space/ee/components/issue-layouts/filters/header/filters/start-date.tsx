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

import React, { useState } from "react";
import { observer } from "mobx-react";
// components
import { FilterHeader } from "@/components/issues/filters/helpers/filter-header";
import { FilterOption } from "@/components/issues/filters/helpers/filter-option";
// constants
import { DATE_AFTER_FILTER_OPTIONS } from "@/plane-web/constants/issue";

type Props = {
  appliedFilters: string[] | null;
  handleUpdate: (val: string | string[]) => void;
  searchQuery: string;
  allowedValues: string[] | undefined;
};

export const FilterStartDate = observer(function FilterStartDate(props: Props) {
  const { appliedFilters, handleUpdate, searchQuery, allowedValues } = props;

  const [previewEnabled, setPreviewEnabled] = useState(true);

  const appliedFiltersCount = appliedFilters?.length ?? 0;

  const filteredOptions = DATE_AFTER_FILTER_OPTIONS.filter(
    (d) => (allowedValues?.includes(d.value) ?? true) && d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <FilterHeader
        title={`Start date${appliedFiltersCount > 0 ? ` (${appliedFiltersCount})` : ""}`}
        isPreviewEnabled={previewEnabled}
        handleIsPreviewEnabled={() => setPreviewEnabled(!previewEnabled)}
      />
      {previewEnabled && (
        <div>
          {filteredOptions.length > 0 ? (
            <>
              {filteredOptions.map((option) => (
                <FilterOption
                  key={option.value}
                  isChecked={appliedFilters?.includes(option.value) ? true : false}
                  onClick={() => handleUpdate(option.value)}
                  title={option.name}
                  multiple
                />
              ))}
            </>
          ) : (
            <p className="text-11 italic text-placeholder">No matches found</p>
          )}
        </div>
      )}
    </>
  );
});
