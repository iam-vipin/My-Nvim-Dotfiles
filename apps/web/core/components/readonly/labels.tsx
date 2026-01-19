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

import { useEffect } from "react";
import { observer } from "mobx-react";
// plane imports
import { Tooltip } from "@plane/propel/tooltip";
import { cn } from "@plane/utils";
// hooks
import { useLabel } from "@/hooks/store/use-label";
import { usePlatformOS } from "@/hooks/use-platform-os";

export type TReadonlyLabelsProps = {
  className?: string;
  hideIcon?: boolean;
  value: string[];
  placeholder?: string;
  projectId: string | undefined;
  workspaceSlug: string;
};

export const ReadonlyLabels = observer(function ReadonlyLabels(props: TReadonlyLabelsProps) {
  const { className, value, projectId, workspaceSlug } = props;

  const { getLabelById, fetchProjectLabels } = useLabel();
  const { isMobile } = usePlatformOS();
  const labels = value
    .map((labelId) => getLabelById(labelId))
    .filter((label): label is NonNullable<typeof label> => Boolean(label));

  useEffect(() => {
    if (projectId) {
      void fetchProjectLabels(workspaceSlug?.toString(), projectId);
    }
  }, [projectId, workspaceSlug, fetchProjectLabels]);

  return (
    <div className={cn("flex items-center gap-2 text-body-xs-regular", className)}>
      {labels && (
        <>
          <Tooltip
            position="top"
            tooltipHeading="Labels"
            tooltipContent={labels.map((l) => l?.name).join(", ")}
            isMobile={isMobile}
            disabled={labels.length === 0}
          >
            <div className="h-full flex items-center gap-1 rounded-sm py-1 text-body-xs-bold">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent-primary" />
              <span>{value.length}</span>
              <span>Labels</span>
            </div>
          </Tooltip>
        </>
      )}
    </div>
  );
});
