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

import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { BriefcaseBusiness } from "lucide-react";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { cn } from "@plane/propel/utils";
import type { TLogoProps } from "@plane/types";
import { useProject } from "@/hooks/store/use-project";

export const DisplayProject = observer(function DisplayProject(props: {
  project: { name: string; id: string; logo_props?: TLogoProps };
  className?: string;
}) {
  const { project, className } = props;
  const { getProjectById } = useProject();
  const projectDetails = getProjectById(project.id);
  const logoProps = project?.logo_props || projectDetails?.logo_props;
  return (
    <div className={cn("flex items-center gap-1 text-13 text-tertiary max-w-[100px] overflow-hidden", className)}>
      {!isEmpty(logoProps) ? (
        <Logo logo={logoProps} size={16} />
      ) : (
        <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
          <BriefcaseBusiness className="h-4 w-4" />
        </span>
      )}
      <div className="truncate">{project?.name}</div>
    </div>
  );
});
