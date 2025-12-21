import type { FC } from "react";
import { observer } from "mobx-react";
// assets
import CSVLogo from "@/app/assets/services/csv.svg?url";
// plane web imports
import { Stepper } from "@/plane-web/components/importers/ui";
// plane web constants
import { IMPORTER_STEPS } from "@/plane-web/constants/importers/flatfile";
// hooks
import { useFlatfileImporter } from "@/plane-web/hooks/store";

export const StepsRoot = observer(function StepsRoot() {
  const { currentStepIndex, resetImporterData } = useFlatfileImporter();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Stepper
        serviceName="CSV Importer"
        logo={CSVLogo}
        steps={IMPORTER_STEPS}
        currentStepIndex={currentStepIndex}
        redirectCallback={resetImporterData}
      />
    </div>
  );
});
