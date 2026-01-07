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
import { MODULE_STATUS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { ModuleStatusIcon } from "@plane/propel/icons";
import type { TModuleStatus } from "@plane/types";
// components
import { FilterHeader, FilterOption } from "@/components/issues/issue-layouts/filters";

type Props = {
  appliedFilters: TModuleStatus[] | null;
  handleUpdate: (val: string) => void;
  searchQuery: string;
};

export const FilterStatus = observer(function FilterStatus(props: Props) {
  const { appliedFilters, handleUpdate, searchQuery } = props;
  // states
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const { t } = useTranslation();

  const filteredOptions = MODULE_STATUS.filter((p) => p.value.includes(searchQuery.toLowerCase()));
  const appliedFiltersCount = appliedFilters?.length ?? 0;

  return (
    <>
      <FilterHeader
        title={`Status${appliedFiltersCount > 0 ? ` (${appliedFiltersCount})` : ""}`}
        isPreviewEnabled={previewEnabled}
        handleIsPreviewEnabled={() => setPreviewEnabled(!previewEnabled)}
      />
      {previewEnabled && (
        <div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((status) => (
              <FilterOption
                key={status.value}
                isChecked={appliedFilters?.includes(status.value) ? true : false}
                onClick={() => handleUpdate(status.value)}
                icon={<ModuleStatusIcon status={status.value} />}
                title={t(status.i18n_label)}
              />
            ))
          ) : (
            <p className="text-11 italic text-placeholder">No matches found</p>
          )}
        </div>
      )}
    </>
  );
});
