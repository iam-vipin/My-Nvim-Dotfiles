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
// assets
import ClickUpLogo from "@/app/assets/services/clickup.svg?url";
// plane web components
import { Stepper } from "@/components/importers/ui";
// plane web constants
import { IMPORTER_CLICKUP_STEPS } from "@/constants/importers/clickup";
// plane web hooks
import { useClickUpImporter } from "@/plane-web/hooks/store";

export const StepsRoot = observer(function StepsRoot() {
  // hooks
  const { currentStepIndex, resetImporterData } = useClickUpImporter();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Stepper
        serviceName="ClickUp"
        logo={ClickUpLogo}
        steps={IMPORTER_CLICKUP_STEPS}
        currentStepIndex={currentStepIndex}
        redirectCallback={resetImporterData}
      />
    </div>
  );
});
