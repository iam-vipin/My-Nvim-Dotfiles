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
export const IntakeFeatureChildren = observer(function IntakeFeatureChildren({
  currentProjectDetails,
  workspaceSlug,
}: Props) {
  const isEmailEnabled = useFlag(workspaceSlug?.toString(), E_FEATURE_FLAGS.INTAKE_EMAIL);
  const isFormEnabled = useFlag(workspaceSlug?.toString(), E_FEATURE_FLAGS.INTAKE_FORM);

  return (
    <>
      <h4 className="mt-4 mb-2 text-13 font-medium text-tertiary">Intake sources</h4>
      <div className="px-4 rounded-sm border transition-all border-subtle-1 bg-layer-1">
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
