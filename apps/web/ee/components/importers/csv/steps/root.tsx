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
// assets
import CSVLogo from "@/app/assets/services/csv.svg?url";
// plane web imports
import { Stepper } from "@/plane-web/components/importers/ui";
// plane web constants
import { CSV_IMPORTER_STEPS } from "@/plane-web/constants/importers/csv";
// hooks
import { useCSVImporter } from "@/plane-web/hooks/store";

/**
 * Steps root component for CSV importer.
 * Renders the stepper UI with navigation between import steps.
 */
export const CSVStepsRoot = observer(function CSVStepsRoot() {
  const { currentStepIndex, resetImporterData } = useCSVImporter();

  return (
    <div className="relative size-full overflow-hidden">
      <Stepper
        serviceName="CSV Importer"
        logo={CSVLogo}
        steps={CSV_IMPORTER_STEPS}
        currentStepIndex={currentStepIndex}
        redirectCallback={resetImporterData}
      />
    </div>
  );
});
