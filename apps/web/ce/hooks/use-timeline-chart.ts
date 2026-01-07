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
import type { TTimelineTypeCore } from "@plane/types";
import { GANTT_TIMELINE_TYPE } from "@plane/types";
// Plane-web

import type { IBaseTimelineStore } from "@/plane-web/store/timeline/base-timeline.store";
import type { ITimelineStore } from "../store/timeline";

export const getTimelineStore = (
  timelineStore: ITimelineStore,
  timelineType: TTimelineTypeCore
): IBaseTimelineStore => {
  if (timelineType === GANTT_TIMELINE_TYPE.ISSUE) {
    return timelineStore.issuesTimeLineStore as IBaseTimelineStore;
  }
  if (timelineType === GANTT_TIMELINE_TYPE.MODULE) {
    return timelineStore.modulesTimeLineStore as IBaseTimelineStore;
  }
  if (timelineType === GANTT_TIMELINE_TYPE.PROJECT) {
    return timelineStore.projectTimeLineStore as IBaseTimelineStore;
  }
  if (timelineType === GANTT_TIMELINE_TYPE.GROUPED) {
    return timelineStore.groupedTimeLineStore as IBaseTimelineStore;
  }
  throw new Error(`Unknown timeline type: ${timelineType}`);
};
