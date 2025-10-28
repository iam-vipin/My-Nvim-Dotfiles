// root store
import type { RootStore } from "../root.store";
// teamspace stores
import type { ITeamspacePageStore } from "./pages/teamspace-page.store";
import { TeamspacePageStore } from "./pages/teamspace-page.store";
import type { ITeamspaceAnalyticsStore } from "./teamspace-analytics.store";
import { TeamspaceAnalyticsStore } from "./teamspace-analytics.store";
import type { ITeamspaceCycleStore } from "./teamspace-cycle.store";
import { TeamspaceCycleStore } from "./teamspace-cycle.store";
import type { ITeamspaceFilterStore } from "./teamspace-filter.store";
import { TeamspaceFilterStore } from "./teamspace-filter.store";
import type { ITeamspaceUpdatesStore } from "./teamspace-updates.store";
import { TeamspaceUpdatesStore } from "./teamspace-updates.store";
import type { ITeamspaceViewStore } from "./teamspace-view.store";
import { TeamspaceViewStore } from "./teamspace-view.store";
import type { ITeamspaceStore } from "./teamspace.store";
import { TeamspaceStore } from "./teamspace.store";

export interface ITeamspaceRootStore {
  teamspaces: ITeamspaceStore;
  teamspaceFilter: ITeamspaceFilterStore;
  teamspaceUpdates: ITeamspaceUpdatesStore;
  teamspaceAnalytics: ITeamspaceAnalyticsStore;
  teamspaceCycle: ITeamspaceCycleStore;
  teamspaceView: ITeamspaceViewStore;
  teamspacePage: ITeamspacePageStore;
}

export class TeamspaceRootStore implements ITeamspaceRootStore {
  teamspaces: ITeamspaceStore;
  teamspaceFilter: ITeamspaceFilterStore;
  teamspaceUpdates: ITeamspaceUpdatesStore;
  teamspaceAnalytics: ITeamspaceAnalyticsStore;
  teamspaceCycle: ITeamspaceCycleStore;
  teamspaceView: ITeamspaceViewStore;
  teamspacePage: ITeamspacePageStore;

  constructor(root: RootStore) {
    this.teamspaces = new TeamspaceStore(root);
    this.teamspaceFilter = new TeamspaceFilterStore(root);
    this.teamspaceUpdates = new TeamspaceUpdatesStore(root);
    this.teamspaceAnalytics = new TeamspaceAnalyticsStore(root);
    this.teamspaceCycle = new TeamspaceCycleStore(root);
    this.teamspaceView = new TeamspaceViewStore(root);
    this.teamspacePage = new TeamspacePageStore(root);
  }
}
