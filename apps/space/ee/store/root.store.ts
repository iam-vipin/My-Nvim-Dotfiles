// plane web stores
import type { IPagesListStore } from "@/plane-web/store/pages";
import { PagesListStore } from "@/plane-web/store/pages";
// store
import { CoreRootStore } from "@/store/root.store";
import type { IFeatureFlagsStore } from "./feature_flags.store";
import { FeatureFlagsStore } from "./feature_flags.store";
import type { IIntakeStore } from "./intake.store";
import { IntakeStore } from "./intake.store";
import type { ICalendarStore } from "./issue_calendar_view.store";
import { CalendarStore } from "./issue_calendar_view.store";
import { ProjectViewStore } from "./views/project-view.store";
import type { IViewIssueFilterStore } from "./views/view-issue-filters.store";
import { ViewIssueFilterStore } from "./views/view-issue-filters.store";
import type { IViewIssueStore } from "./views/view-issues.store";
import { ViewIssueStore } from "./views/view-issues.store";

export class RootStore extends CoreRootStore {
  pagesListStore: IPagesListStore;
  projectViewStore: ProjectViewStore;
  viewIssues: IViewIssueStore;
  viewIssuesFilter: IViewIssueFilterStore;
  calendarStore: ICalendarStore;
  intakeStore: IIntakeStore;
  featureFlagsStore: IFeatureFlagsStore;

  constructor() {
    super();
    this.pagesListStore = new PagesListStore(this);
    this.projectViewStore = new ProjectViewStore(this);
    this.viewIssues = new ViewIssueStore(this);
    this.viewIssuesFilter = new ViewIssueFilterStore(this);
    this.calendarStore = new CalendarStore();
    this.intakeStore = new IntakeStore();
    this.featureFlagsStore = new FeatureFlagsStore();
  }

  reset() {
    super.reset();
    this.pagesListStore = new PagesListStore(this);
    this.projectViewStore = new ProjectViewStore(this);
    this.viewIssues = new ViewIssueStore(this);
    this.viewIssuesFilter = new ViewIssueFilterStore(this);
    this.calendarStore = new CalendarStore();
    this.intakeStore = new IntakeStore();
    this.featureFlagsStore = new FeatureFlagsStore();
  }
}
