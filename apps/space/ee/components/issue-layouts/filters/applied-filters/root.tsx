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
import { useCallback } from "react";
import { cloneDeep } from "lodash-es";
import { observer } from "mobx-react";
// types
import type { IIssueFilterOptions } from "@plane/types";
// components
import { useViewIssuesFilter } from "@/plane-web/hooks/store/use-view-issues-filter";
//
import { AppliedFiltersList } from "./filters-list";

type Props = {
  anchor: string;
};

export const ViewAppliedFilters = observer(function ViewAppliedFilters(props: Props) {
  const { anchor } = props;
  // store hooks
  const { getIssueFilters, initIssueFilters, updateIssueFilters } = useViewIssuesFilter();
  // derived values
  const issueFilters = getIssueFilters(anchor);

  const handleFilters = useCallback(
    (key: keyof IIssueFilterOptions, value: string | null) => {
      let newValues = cloneDeep(issueFilters?.[key]) ?? [];

      if (value === null) newValues = [];
      else if (newValues.includes(value)) newValues.splice(newValues.indexOf(value), 1);

      updateIssueFilters(anchor, key, newValues);
    },
    [anchor, issueFilters, updateIssueFilters]
  );

  const handleRemoveAllFilters = () => {
    initIssueFilters(anchor, {}, true);
  };

  if (!issueFilters) return <></>;

  const appliedFilters: any = {};
  Object.entries(issueFilters).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value) && value.length === 0) return;
    appliedFilters[key] = value;
  });

  if (Object.keys(appliedFilters).length === 0) return <></>;

  return (
    <div className="border-b border-subtle-1 bg-surface-1 p-4">
      <AppliedFiltersList
        appliedFilters={appliedFilters || {}}
        handleRemoveFilter={handleFilters}
        handleClearAllFilters={handleRemoveAllFilters}
      />
    </div>
  );
});
