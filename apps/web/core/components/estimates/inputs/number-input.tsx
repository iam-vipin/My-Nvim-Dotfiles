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
import { useTranslation } from "@plane/i18n";
type TEstimateNumberInputProps = {
  value?: number;
  handleEstimateInputValue: (value: string) => void;
};

export function EstimateNumberInput(props: TEstimateNumberInputProps) {
  const { value, handleEstimateInputValue } = props;

  // i18n
  const { t } = useTranslation();

  return (
    <input
      value={value}
      onChange={(e) => handleEstimateInputValue(e.target.value)}
      className="border-none focus:ring-0 focus:border-0 focus:outline-none px-2 py-2 w-full bg-transparent text-13"
      placeholder={t("project_settings.estimates.create.enter_estimate_point")}
      autoFocus
      type="number"
      step="any"
    />
  );
}
