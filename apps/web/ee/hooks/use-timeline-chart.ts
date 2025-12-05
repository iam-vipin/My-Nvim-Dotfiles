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
  return getBaseTimelineStore(timelineStore, timelineType as TTimelineTypeCore);
};
