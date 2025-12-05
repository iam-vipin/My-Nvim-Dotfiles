import { observer } from "mobx-react";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
import type { IProject } from "@plane/types";
// plane web components
import IntakeResponsibility from "@/plane-web/components/projects/settings/intake/intake-responsibility";
import { INTAKE_FEATURES_LIST, INTAKE_RESPONSIBILITY_LIST } from "@/plane-web/constants";
// hooks
import { useFlag } from "@/plane-web/hooks/store/use-flag";
import IntakeSubFeatures from "./intake-sub-features";
import IntakeSubFeaturesUpgrade from "./intake-sub-features-upgrade";

type Props = {
  currentProjectDetails: IProject;
  workspaceSlug: string;
};
export const IntakeFeatureChildren = observer(({ currentProjectDetails, workspaceSlug }: Props) => {
  const isEmailEnabled = useFlag(workspaceSlug?.toString(), E_FEATURE_FLAGS.INTAKE_EMAIL);
  const isFormEnabled = useFlag(workspaceSlug?.toString(), E_FEATURE_FLAGS.INTAKE_FORM);

  return (
    <>
      <h4 className="mt-4 mb-2 text-sm font-medium text-custom-text-300">Intake sources</h4>
      <div className="px-4 rounded border transition-all border-custom-border-200 bg-custom-background-90">
        {isEmailEnabled || isFormEnabled ? (
          <IntakeSubFeatures projectId={currentProjectDetails?.id} featureList={INTAKE_FEATURES_LIST} />
        ) : (
          <IntakeSubFeaturesUpgrade projectId={currentProjectDetails?.id} featureList={INTAKE_FEATURES_LIST} />
        )}
      </div>

      <IntakeResponsibility projectId={currentProjectDetails?.id} featureList={INTAKE_RESPONSIBILITY_LIST} />
    </>
  );
});
