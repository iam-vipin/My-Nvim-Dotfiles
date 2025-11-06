import type { RootStore } from "@/plane-web/store/root.store";
import type { IBaseTimelineStore } from "@/plane-web/store/timeline/base-timeline.store";
import type { IIssuesTimeLineStore } from "@/store/timeline/issues-timeline.store";
import { IssuesTimeLineStore } from "@/store/timeline/issues-timeline.store";
import type { IModulesTimeLineStore } from "@/store/timeline/modules-timeline.store";
import { ModulesTimeLineStore } from "@/store/timeline/modules-timeline.store";
import { GroupedTimeLineStore } from "./grouped-timeline.store";
import type { IProjectsTimeLineStore } from "./project-timeline.store";
import { ProjectsTimeLineStore } from "./project-timeline.store";

export interface ITimelineStore {
  issuesTimeLineStore: IIssuesTimeLineStore;
  modulesTimeLineStore: IModulesTimeLineStore;
  projectTimeLineStore: IProjectsTimeLineStore;
  groupedTimeLineStore: IBaseTimelineStore;
}

export class TimeLineStore implements ITimelineStore {
  issuesTimeLineStore: IIssuesTimeLineStore;
  modulesTimeLineStore: IModulesTimeLineStore;
  projectTimeLineStore: IProjectsTimeLineStore;
  groupedTimeLineStore: IBaseTimelineStore;

  constructor(rootStore: RootStore) {
    this.issuesTimeLineStore = new IssuesTimeLineStore(rootStore);
    this.modulesTimeLineStore = new ModulesTimeLineStore(rootStore);
    this.projectTimeLineStore = new ProjectsTimeLineStore(rootStore);
    this.groupedTimeLineStore = new GroupedTimeLineStore(rootStore);
  }
}
