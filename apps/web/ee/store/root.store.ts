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

// plane web store
import type { ICycleStore } from "@/plane-web/store/cycle";
import { CycleStore } from "@/plane-web/store/cycle";
import type { IWorkspaceNotificationStore } from "@/plane-web/store/notifications/notifications.store";
import { WorkspaceNotificationStore } from "@/plane-web/store/notifications/notifications.store";
import type { IPublishPageStore } from "@/plane-web/store/pages/publish-page.store";
import { PublishPageStore } from "@/plane-web/store/pages/publish-page.store";
import type { IWorkspacePageStore } from "@/plane-web/store/pages/workspace-page.store";
import { WorkspacePageStore } from "@/plane-web/store/pages/workspace-page.store";
import type { ISelfHostedSubscriptionStore } from "@/plane-web/store/subscription/self-hosted-subscription.store";
import { SelfHostedSubscriptionStore } from "@/plane-web/store/subscription/self-hosted-subscription.store";
import type { IWorkspaceSubscriptionStore } from "@/plane-web/store/subscription/subscription.store";
import { WorkspaceSubscriptionStore } from "@/plane-web/store/subscription/subscription.store";
import { TimeLineStore } from "@/plane-web/store/timeline";
import type { IProjectFilterStore, IWorkspaceProjectStatesStore } from "@/plane-web/store/workspace-project-states";
import { ProjectFilterStore, WorkspaceProjectStatesStore } from "@/plane-web/store/workspace-project-states";
// store
import { CoreRootStore } from "@/store/root.store";
// theme
import type { IThemeStore } from "./theme.store";
import { ThemeStore } from "./theme.store";
// importers
import type { IGlobalViewStore } from "./global-view.store";
import { GlobalViewStore } from "./global-view.store";
// timeline
import type { IProjectInboxStore } from "./project-inbox.store";
import { ProjectInboxStore } from "./project-inbox.store";
// project view
import type { IProjectViewStore } from "./project-view.store";
import { ProjectViewStore } from "./project-view.store";
import type { IProjectStore } from "./projects/projects";
import { ProjectStore } from "./projects/projects";
// timeline
import type { ITimelineStore } from "./timeline";

export class RootStore extends CoreRootStore {
  // Override theme with extended type
  theme: IThemeStore;
  workspacePages: IWorkspacePageStore;
  publishPage: IPublishPageStore;
  workspaceSubscription: IWorkspaceSubscriptionStore;
  selfHostedSubscription: ISelfHostedSubscriptionStore;
  workspaceProjectStates: IWorkspaceProjectStatesStore;
  projectFilter: IProjectFilterStore;
  cycle: ICycleStore;
  timelineStore: ITimelineStore;
  projectDetails: IProjectStore;
  workspaceNotification: IWorkspaceNotificationStore;
  projectInbox: IProjectInboxStore;
  projectView: IProjectViewStore;
  globalView: IGlobalViewStore;

  constructor() {
    super();
    // Override the theme store with extended version
    this.theme = new ThemeStore();
    this.workspacePages = new WorkspacePageStore(this);
    this.publishPage = new PublishPageStore(this);
    this.workspaceSubscription = new WorkspaceSubscriptionStore(this);
    this.selfHostedSubscription = new SelfHostedSubscriptionStore(this);
    this.workspaceProjectStates = new WorkspaceProjectStatesStore(this);
    this.projectFilter = new ProjectFilterStore(this);
    this.cycle = new CycleStore(this);
    this.timelineStore = new TimeLineStore(this);
    this.projectDetails = new ProjectStore(this);
    this.workspaceNotification = new WorkspaceNotificationStore(this);
    this.projectInbox = new ProjectInboxStore(this);
    // project members activity
    // project view
    this.projectView = new ProjectViewStore(this);
    this.globalView = new GlobalViewStore(this);
  }

  resetOnSignOut() {
    super.resetOnSignOut();
    // Override theme store reset
    this.theme = new ThemeStore();
    this.workspacePages = new WorkspacePageStore(this);
    this.publishPage = new PublishPageStore(this);
    this.workspaceSubscription = new WorkspaceSubscriptionStore(this);
    this.selfHostedSubscription = new SelfHostedSubscriptionStore(this);
    this.workspaceProjectStates = new WorkspaceProjectStatesStore(this);
    this.projectFilter = new ProjectFilterStore(this);
    this.cycle = new CycleStore(this);
    this.timelineStore = new TimeLineStore(this);
    this.projectDetails = new ProjectStore(this);
    this.projectView = new ProjectViewStore(this);
    this.globalView = new GlobalViewStore(this);
  }
}
