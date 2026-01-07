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
import { useTimeLineType } from "@/components/gantt-chart/contexts";
import { MilestoneIndicatorsRoot } from "./milestone-indicators-root";

type Props = {
  itemsContainerWidth: number;
  blockCount: number;
};

export const GanttAdditionalLayers = observer(function GanttAdditionalLayers({ blockCount }: Props) {
  const timelineType = useTimeLineType();
  if (!timelineType) return null;
  return (
    <>
      <MilestoneIndicatorsRoot timelineType={timelineType} blockCount={blockCount} />
      {/* Future additional layers can be added here */}
    </>
  );
});
