import type { FC } from "react";
import { observer } from "mobx-react";
// assets
import LinearLogo from "@/app/assets/services/linear.svg?url";
// plane web components
import { Stepper } from "@/plane-web/components/importers/ui";
// plane web constants
import { IMPORTER_LINEAR_STEPS } from "@/plane-web/constants/importers/linear";
// plane web hooks
import { useLinearImporter } from "@/plane-web/hooks/store";

export const StepsRoot = observer(function StepsRoot() {
  // hooks
  const { currentStepIndex, resetImporterData } = useLinearImporter();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Stepper
        serviceName="Linear"
        logo={LinearLogo}
        steps={IMPORTER_LINEAR_STEPS}
        currentStepIndex={currentStepIndex}
        redirectCallback={resetImporterData}
      />
    </div>
  );
});
