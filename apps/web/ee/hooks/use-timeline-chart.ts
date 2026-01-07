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

// types
import type { TTimelineType, TTimelineTypeCore } from "@plane/types";
import { GANTT_TIMELINE_TYPE } from "@plane/types";
// CE
import { getTimelineStore as getBaseTimelineStore } from "@/ce/hooks/use-timeline-chart";
// Plane-web
import type { IBaseTimelineStore } from "@/plane-web/store/timeline/base-timeline.store";
// EE
import type { ITimelineStore } from "../store/timeline";

export const getTimelineStore = (timelineStore: ITimelineStore, timelineType: TTimelineType): IBaseTimelineStore => {
  if (timelineType === GANTT_TIMELINE_TYPE.INITIATIVE) {
    return timelineStore.initiativesTimeLineStore as IBaseTimelineStore;
  }
  return getBaseTimelineStore(timelineStore, timelineType);
};
