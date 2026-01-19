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
import { useTranslation } from "@plane/i18n";
import type { IIssueDisplayFilterOptions, TIssueExtraOptions } from "@plane/types";
// components
import { FilterOption } from "@/components/issues/issue-layouts/filters";

// constants
const ISSUE_EXTRA_OPTIONS: {
  key: TIssueExtraOptions;
  titleTranslationKey: string;
}[] = [
  {
    key: "sub_issue",
    titleTranslationKey: "issue.display.extra.show_sub_issues",
  }, // in spreadsheet its always false
  {
    key: "show_empty_groups",
    titleTranslationKey: "issue.display.extra.show_empty_groups",
  }, // filter on front-end
];

type Props = {
  selectedExtraOptions: {
    sub_issue: boolean;
    show_empty_groups: boolean;
  };
  handleUpdate: (key: keyof IIssueDisplayFilterOptions, val: boolean) => void;
  enabledExtraOptions: TIssueExtraOptions[];
};

export const FilterExtraOptions = observer(function FilterExtraOptions(props: Props) {
  const { selectedExtraOptions, handleUpdate, enabledExtraOptions } = props;
  // hooks
  const { t } = useTranslation();
  const isExtraOptionEnabled = (option: TIssueExtraOptions) => enabledExtraOptions.includes(option);

  return (
    <div>
      {ISSUE_EXTRA_OPTIONS.map((option) => {
        if (!isExtraOptionEnabled(option.key)) return null;

        return (
          <FilterOption
            key={option.key}
            isChecked={selectedExtraOptions?.[option.key] ? true : false}
            onClick={() => handleUpdate(option.key, !selectedExtraOptions?.[option.key])}
            title={t(option.titleTranslationKey)}
          />
        );
      })}
    </div>
  );
});
