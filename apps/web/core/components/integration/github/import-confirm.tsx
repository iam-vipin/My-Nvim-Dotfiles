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

// react-hook-form
import type { UseFormWatch } from "react-hook-form";
// ui
import { Button } from "@plane/propel/button";
// types
import type { TFormValues, TIntegrationSteps } from "@/components/integration";

type Props = {
  handleStepChange: (value: TIntegrationSteps) => void;
  watch: UseFormWatch<TFormValues>;
};

export function GithubImportConfirm({ handleStepChange, watch }: Props) {
  return (
    <div className="mt-6">
      <h4 className="font-medium text-secondary">
        You are about to import work items from {watch("github").full_name}. Click on {'"'}Confirm & Import{'" '}
        to complete the process.
      </h4>
      <div className="mt-6 flex items-center justify-between">
        <Button variant="secondary" onClick={() => handleStepChange("import-users")}>
          Back
        </Button>
        <Button variant="primary" type="submit">
          Confirm & Import
        </Button>
      </div>
    </div>
  );
}
