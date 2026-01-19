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
import { PlusIcon } from "@plane/propel/icons";
import type { TQuickAddIssueButton } from "../root";

export const SpreadsheetAddIssueButton = observer(function SpreadsheetAddIssueButton(props: TQuickAddIssueButton) {
  const { onClick, isEpic = false } = props;
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      <button
        type="button"
        className="flex items-center gap-x-[6px] w-full px-2 py-2 bg-layer-transparent hover:bg-layer-transparent-hover transition-colors"
        onClick={onClick}
      >
        <PlusIcon className="h-3.5 w-3.5 stroke-2" />
        <span className="text-13 font-medium">{isEpic ? t("epic.add.label") : t("issue.add.label")}</span>
      </button>
    </div>
  );
});
