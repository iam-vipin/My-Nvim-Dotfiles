"use client";

import type { FC } from "react";
// plane web components
import { observer } from "mobx-react";
// assets
import AsanaLogo from "@/app/assets/services/asana.svg";
// plane web imports
import { Stepper } from "@/plane-web/components/importers/ui";
import { IMPORTER_STEPS } from "@/plane-web/constants/importers/asana";
import { useAsanaImporter } from "@/plane-web/hooks/store";

export const StepsRoot: FC = observer(() => {
  // hooks
  const { currentStepIndex, resetImporterData } = useAsanaImporter();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Stepper
        serviceName="Asana"
        logo={AsanaLogo}
        steps={IMPORTER_STEPS}
        currentStepIndex={currentStepIndex}
        redirectCallback={resetImporterData}
      />
    </div>
  );
});
