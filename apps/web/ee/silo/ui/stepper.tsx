import { Fragment } from "react";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
// helpers
import { cn } from "@plane/utils";
// silo types
import type { TStepper, TStepperNavigation } from "@/plane-web/silo/types/ui";

export function Stepper<T>(props: TStepper<T>) {
  // props
  const { logo, steps, currentStepIndex } = props;
  // derived value
  const currentStepDetails = steps[currentStepIndex];

  const { t } = useTranslation();

  return (
    <div className="relative w-full h-full flex flex-col space-y-6 overflow-hidden">
      <div className="space-y-6">
        {/* stepper header */}
        <div className="flex-shrink-0 relative flex items-center gap-6">
          {logo && (
            <div className="flex-shrink-0 w-12 h-12 bg-layer-1 relative flex justify-center items-center rounded-sm overflow-hidden">
              <img src={logo} alt={`Importer Logo`} className="w-8 h-8 object-contain" />
            </div>
          )}

          <div className="w-full h-full relative overflow-hidden flex justify-between items-center">
            {steps.map((step, index) => (
              <Fragment key={index}>
                {/* left bar */}
                {step?.prevStep && (
                  <div
                    className={cn("h-[1.5px] w-full bg-custom-border-200 transition-all", {
                      "bg-accent-primary": index <= currentStepIndex,
                    })}
                  />
                )}

                {/* content */}
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 relative flex justify-center items-center border bg-custom-border-200 border-subtle-1 text-secondary rounded-full transition-all",
                    {
                      "bg-accent-primary border-accent-strong text-on-color": index <= currentStepIndex,
                    }
                  )}
                >
                  {step?.icon ? step?.icon() : index + 1}
                </div>

                {/* right bar */}
                {step?.nextStep && index < steps.length - 1 && (
                  <div
                    className={cn("h-[1.5px] w-full bg-custom-border-200 transition-all", {
                      "bg-accent-primary": index < currentStepIndex,
                    })}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* title and description */}
        <div className="flex-shrink-0 space-y-1">
          <div className="text-18 font-bold">{t(currentStepDetails?.i18n_title)}</div>
          <div className="text-secondary text-13">{t(currentStepDetails?.i18n_description)}</div>
        </div>
      </div>

      {/* component */}
      {currentStepDetails?.component && <div className="h-full overflow-hidden">{currentStepDetails.component()}</div>}
    </div>
  );
}

export function StepperNavigation<T>(props: TStepperNavigation<T>) {
  const { currentStep, handleStep, children } = props;
  const { t } = useTranslation();
  return (
    <div className="flex-shrink-0 relative flex items-center gap-2">
      <Button variant="secondary" onClick={() => handleStep("previous")} disabled={currentStep?.prevStep === undefined}>
        {t("common.back")}
      </Button>
      {children ? (
        children
      ) : (
        <Button variant="secondary" onClick={() => handleStep("next")} disabled={currentStep?.nextStep === undefined}>
          {t("common.next")}
        </Button>
      )}
    </div>
  );
}
