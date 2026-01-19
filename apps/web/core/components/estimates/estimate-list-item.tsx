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
import { EEstimateSystem } from "@plane/constants";
import { convertMinutesToHoursMinutesString, cn } from "@plane/utils";
// helpers
// hooks
import { useProjectEstimates } from "@/hooks/store/estimates";
import { useEstimate } from "@/hooks/store/estimates/use-estimate";
// plane web components
import { EstimateListItemButtons } from "@/plane-web/components/estimates";

type TEstimateListItem = {
  estimateId: string;
  isAdmin: boolean;
  isEstimateEnabled: boolean;
  isEditable: boolean;
  onEditClick?: (estimateId: string) => void;
  onDeleteClick?: (estimateId: string) => void;
};

export const EstimateListItem = observer(function EstimateListItem(props: TEstimateListItem) {
  const { estimateId, isAdmin, isEstimateEnabled, isEditable } = props;
  // hooks
  const { estimateById } = useProjectEstimates();
  const { estimatePointIds, estimatePointById } = useEstimate(estimateId);
  const currentEstimate = estimateById(estimateId);

  // derived values
  const estimatePointValues = estimatePointIds?.map((estimatePointId) => {
    const estimatePoint = estimatePointById(estimatePointId);
    if (estimatePoint) return estimatePoint.value;
  });

  if (!currentEstimate) return <></>;
  return (
    <div
      className={cn(
        "relative border-b border-subtle flex justify-between items-center gap-3 py-3.5",
        isAdmin && isEditable && isEstimateEnabled ? `text-primary` : `text-secondary`
      )}
    >
      <div className="space-y-1">
        <h3 className="font-medium text-14">{currentEstimate?.name}</h3>
        <p className="text-11">
          {estimatePointValues
            ?.map((estimatePointValue) => {
              if (currentEstimate?.type === EEstimateSystem.TIME) {
                return convertMinutesToHoursMinutesString(Number(estimatePointValue));
              }
              return estimatePointValue;
            })
            .join(", ")}
        </p>
      </div>
      <EstimateListItemButtons {...props} />
    </div>
  );
});
