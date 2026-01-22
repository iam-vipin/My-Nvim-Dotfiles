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
import { Stepper } from "@/components/importers/ui";
// plane web constants
import { NOTION_IMPORTER_STEPS, CONFLUENCE_IMPORTER_STEPS } from "@/constants/importers/notion";
import { useZipImporter } from "@/plane-web/hooks/store/importers/use-zip-importer";
import type { TZipImporterProps } from "@/types/importers/zip-importer";
import { EZipDriverType } from "@/types/importers/zip-importer";

export const StepsRoot = observer(function StepsRoot({ driverType, logo, serviceName }: TZipImporterProps) {
  const { currentStepIndex, resetImporterData } = useZipImporter(driverType);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Stepper
        serviceName={serviceName}
        logo={logo}
        steps={driverType === EZipDriverType.NOTION ? NOTION_IMPORTER_STEPS : CONFLUENCE_IMPORTER_STEPS}
        currentStepIndex={currentStepIndex}
        redirectCallback={resetImporterData}
      />
    </div>
  );
});
