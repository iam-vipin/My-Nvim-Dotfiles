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
import type { IIssueTypesStore } from "@plane/types";
import type { ICustomerPropertiesStore, ICustomersStore } from "@/plane-web/store/customers";
import { CustomerProperties, CustomerStore } from "@/plane-web/store/customers";
import type { ICycleStore } from "@/plane-web/store/cycle";
import { CycleStore } from "@/plane-web/store/cycle";
import type { IFeatureFlagsStore } from "@/plane-web/store/feature-flags/feature-flags.store";
import { FeatureFlagsStore } from "@/plane-web/store/feature-flags/feature-flags.store";
import type { IIntakeResponsibilityStore } from "@/plane-web/store/intake-responsibility.store";
import { IntakeResponsibilityStore } from "@/plane-web/store/intake-responsibility.store";
import { IssueTypes } from "@/plane-web/store/issue-types";
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
import type { ITeamspaceRootStore } from "@/plane-web/store/teamspace";
import { TeamspaceRootStore } from "@/plane-web/store/teamspace";
import { TimeLineStore } from "@/plane-web/store/timeline";
import type { IWorkspaceFeatureStore } from "@/plane-web/store/workspace-feature.store";
import { WorkspaceFeatureStore } from "@/plane-web/store/workspace-feature.store";
import type { IWorkspaceMembersActivityStore } from "@/plane-web/store/workspace-members-activity.store";
import { WorkspaceMembersActivityStore } from "@/plane-web/store/workspace-members-activity.store";
import type { IProjectFilterStore, IWorkspaceProjectStatesStore } from "@/plane-web/store/workspace-project-states";
import { ProjectFilterStore, WorkspaceProjectStatesStore } from "@/plane-web/store/workspace-project-states";
import type { IWorklogStore, IWorklogDownloadStore } from "@/plane-web/store/worklog";
import { WorklogStore, WorklogDownloadStore } from "@/plane-web/store/worklog";
import type { IProjectMembersActivityStore } from "@/plane-web/store/project-members-activity.store";
import { ProjectMembersActivityStore } from "@/plane-web/store/project-members-activity.store";
// store
import { CoreRootStore } from "@/store/root.store";
// theme
import type { IThemeStore } from "./theme.store";
import { ThemeStore } from "./theme.store";
import { EZipDriverType } from "@/types/importers/zip-importer";
// automations
import type { IAutomationsRootStore } from "./automations/root.store";
import { AutomationsRootStore } from "./automations/root.store";
// dashboards
import type { IBaseDashboardsStore } from "./dashboards/base-dashboards.store";
import { BaseDashboardsStore } from "./dashboards/base-dashboards.store";
// importers
import type { IGlobalViewStore } from "./global-view.store";
import { GlobalViewStore } from "./global-view.store";
import type {
  ICSVImporterStore,
  IJiraStore,
  IJiraServerStore,
  ILinearStore,
  IFlatfileStore,
  IAsanaStore,
  IZipImporterStore,
} from "./importers";
import {
  CSVImporterStore,
  JiraStore,
  JiraServerStore,
  LinearStore,
  AsanaStore,
  FlatfileStore,
  ZipImporterStore,
} from "./importers";
// initiative
import type { IClickUpStore } from "./importers/clickup/root.store";
import { ClickUpStore } from "./importers/clickup/root.store";
import type { IInitiativeFilterStore } from "./initiatives/initiatives-filter.store";
import { InitiativeFilterStore } from "./initiatives/initiatives-filter.store";
import type { IInitiativeStore } from "./initiatives/initiatives.store";
import { InitiativeStore } from "./initiatives/initiatives.store";
// intake type forms
import { IntakeTypeFormStore } from "./intake-type-form.store";
import type { IIntakeTypeFormStore } from "./intake-type-form.store";
// integrations
import type {
  ISlackStore,
  IGithubStore,
  IGitlabStore,
  IConnectionStore,
  ISentryStore,
  IGithubEnterpriseStore,
  IGitlabEnterpriseStore,
} from "./integrations";
import {
  SlackStore,
  GithubStore,
  GitlabStore,
  ConnectionStore,
  SentryStore,
  GithubEnterpriseStore,
  GitlabEnterpriseStore,
} from "./integrations";

import type { IEpicAnalyticStore } from "./issue/epic/analytic.store";
import { EpicAnalytics } from "./issue/epic/analytic.store";
import type { IEpicBaseStore } from "./issue/epic/base.store";
import { EpicBaseStore } from "./issue/epic/base.store";
// marketplace
import { ApplicationStore } from "./marketplace/application.store";
import type { IApplicationStore } from "./marketplace/application.store";
import { MilestoneStore } from "./milestones/milestone.store";
import type { IMilestoneStore } from "./milestones/milestone.store";
// Plane AI
import type { IPiChatStore } from "./pi-chat/pi-chat";
import { PiChatStore } from "./pi-chat/pi-chat";
import type { IAgentStore } from "./agent";
import { AgentStore } from "./agent";
// timeline
import type { IProjectInboxStore } from "./project-inbox.store";
import { ProjectInboxStore } from "./project-inbox.store";
// project view
import type { IProjectViewStore } from "./project-view.store";
import { ProjectViewStore } from "./project-view.store";
import type { IProjectStore } from "./projects/projects";
import { ProjectStore } from "./projects/projects";
// templates
import type { IRecurringWorkItemsRootStore } from "./recurring-work-items/root.store";
import { RecurringWorkItemsRootStore } from "./recurring-work-items/root.store";
import type { ITemplatesRootStore } from "./templates/store/root.store";
import { TemplatesRootStore } from "./templates/store/root.store";
// timeline
import type { ITimelineStore } from "./timeline";

export class RootStore extends CoreRootStore {
  // Override theme with extended type
  theme: IThemeStore;
  workspacePages: IWorkspacePageStore;
  publishPage: IPublishPageStore;
  workspaceSubscription: IWorkspaceSubscriptionStore;
  workspaceMembersActivityStore: IWorkspaceMembersActivityStore;
  workspaceWorklogs: IWorklogStore;
  workspaceWorklogDownloads: IWorklogDownloadStore;
  featureFlags: IFeatureFlagsStore;
  selfHostedSubscription: ISelfHostedSubscriptionStore;
  workspaceFeatures: IWorkspaceFeatureStore;
  workspaceProjectStates: IWorkspaceProjectStatesStore;
  projectFilter: IProjectFilterStore;
  issueTypes: IIssueTypesStore;
  cycle: ICycleStore;
  piChat: IPiChatStore;
  agent: IAgentStore;
  timelineStore: ITimelineStore;
  projectDetails: IProjectStore;
  teamspaceRoot: ITeamspaceRootStore;
  workspaceNotification: IWorkspaceNotificationStore;
  projectInbox: IProjectInboxStore;
  customersStore: ICustomersStore;
  customerPropertiesStore: ICustomerPropertiesStore;
  projectMembersActivityStore: IProjectMembersActivityStore;
  projectView: IProjectViewStore;
  globalView: IGlobalViewStore;
  // importers
  jiraImporter: IJiraStore;
  csvImporter: ICSVImporterStore;
  jiraServerImporter: IJiraServerStore;
  linearImporter: ILinearStore;
  asanaImporter: IAsanaStore;
  flatfileImporter: IFlatfileStore;
  clickupImporter: IClickUpStore;
  notionImporter: IZipImporterStore;
  confluenceImporter: IZipImporterStore;
  // integrations
  connections: IConnectionStore;
  slackIntegration: ISlackStore;
  githubIntegration: IGithubStore;
  githubEnterpriseIntegration: IGithubEnterpriseStore;
  gitlabIntegration: IGitlabStore;
  gitlabEnterpriseIntegration: IGitlabEnterpriseStore;
  sentryIntegration: ISentryStore;
  initiativeFilterStore: IInitiativeFilterStore;
  initiativeStore: IInitiativeStore;
  // dashboards
  baseDashboards: IBaseDashboardsStore;
  // epics
  epicAnalytics: IEpicAnalyticStore;
  epicBaseStore: IEpicBaseStore;
  // marketplace
  applicationStore: IApplicationStore;
  // templates
  templatesRoot: ITemplatesRootStore;
  // recurring work items
  recurringWorkItemsRoot: IRecurringWorkItemsRootStore;
  // automations
  automationsRoot: IAutomationsRootStore;
  // milestones
  milestone: IMilestoneStore;
  // intake type forms
  intakeTypeForms: IIntakeTypeFormStore;
  // intake responsibility
  intakeResponsibility: IIntakeResponsibilityStore;

  constructor() {
    super();
    // Override the theme store with extended version
    this.theme = new ThemeStore();
    this.workspacePages = new WorkspacePageStore(this);
    this.publishPage = new PublishPageStore(this);
    this.workspaceSubscription = new WorkspaceSubscriptionStore(this);
    this.workspaceMembersActivityStore = new WorkspaceMembersActivityStore(this);
    this.workspaceWorklogs = new WorklogStore(this);
    this.workspaceWorklogDownloads = new WorklogDownloadStore(this);
    this.featureFlags = new FeatureFlagsStore(this);
    this.selfHostedSubscription = new SelfHostedSubscriptionStore(this);
    this.workspaceFeatures = new WorkspaceFeatureStore(this);
    this.workspaceProjectStates = new WorkspaceProjectStatesStore(this);
    this.issueTypes = new IssueTypes(this);
    this.projectFilter = new ProjectFilterStore(this);
    this.cycle = new CycleStore(this);
    this.piChat = new PiChatStore(this);
    this.agent = new AgentStore(this);
    this.timelineStore = new TimeLineStore(this);
    this.projectDetails = new ProjectStore(this);
    this.teamspaceRoot = new TeamspaceRootStore(this);
    this.workspaceNotification = new WorkspaceNotificationStore(this);
    this.projectInbox = new ProjectInboxStore(this);
    this.customersStore = new CustomerStore(this);
    this.customerPropertiesStore = new CustomerProperties(this);
    // project members activity
    this.projectMembersActivityStore = new ProjectMembersActivityStore(this);
    // project view
    this.projectView = new ProjectViewStore(this);
    this.globalView = new GlobalViewStore(this);
    // importers
    this.jiraImporter = new JiraStore(this);
    this.csvImporter = new CSVImporterStore(this);
    this.jiraServerImporter = new JiraServerStore(this);
    this.linearImporter = new LinearStore(this);
    this.asanaImporter = new AsanaStore(this);
    this.flatfileImporter = new FlatfileStore(this);
    this.clickupImporter = new ClickUpStore(this);
    this.notionImporter = new ZipImporterStore(this, EZipDriverType.NOTION);
    this.confluenceImporter = new ZipImporterStore(this, EZipDriverType.CONFLUENCE);
    // integrations
    this.connections = new ConnectionStore(this);
    this.slackIntegration = new SlackStore(this);
    this.githubIntegration = new GithubStore(this);
    this.githubEnterpriseIntegration = new GithubEnterpriseStore(this);
    this.gitlabIntegration = new GitlabStore(this);
    this.gitlabEnterpriseIntegration = new GitlabEnterpriseStore(this);
    this.sentryIntegration = new SentryStore(this);
    this.initiativeFilterStore = new InitiativeFilterStore(this);
    this.initiativeStore = new InitiativeStore(this, this.initiativeFilterStore);
    // dashboards
    this.baseDashboards = new BaseDashboardsStore(this);
    // epics
    this.epicAnalytics = new EpicAnalytics(this);
    this.epicBaseStore = new EpicBaseStore(this);
    // marketplace
    this.applicationStore = new ApplicationStore(this);
    // templates
    this.templatesRoot = new TemplatesRootStore(this);
    // recurring work items
    this.recurringWorkItemsRoot = new RecurringWorkItemsRootStore(this);
    // automations
    this.automationsRoot = new AutomationsRootStore(this);
    // milestones
    this.milestone = new MilestoneStore(this);
    // intake type forms
    this.intakeTypeForms = new IntakeTypeFormStore(this);
    // intake responsibility
    this.intakeResponsibility = new IntakeResponsibilityStore(this);
  }

  resetOnSignOut() {
    super.resetOnSignOut();
    // Override theme store reset
    this.theme = new ThemeStore();
    this.workspacePages = new WorkspacePageStore(this);
    this.publishPage = new PublishPageStore(this);
    this.workspaceSubscription = new WorkspaceSubscriptionStore(this);
    this.workspaceMembersActivityStore = new WorkspaceMembersActivityStore(this);
    this.workspaceWorklogs = new WorklogStore(this);
    this.workspaceWorklogDownloads = new WorklogDownloadStore(this);
    this.featureFlags = new FeatureFlagsStore(this);
    this.selfHostedSubscription = new SelfHostedSubscriptionStore(this);
    this.workspaceFeatures = new WorkspaceFeatureStore(this);
    this.workspaceProjectStates = new WorkspaceProjectStatesStore(this);
    this.issueTypes = new IssueTypes(this);
    this.projectFilter = new ProjectFilterStore(this);
    this.cycle = new CycleStore(this);
    this.piChat = new PiChatStore(this);
    this.agent = new AgentStore(this);
    this.timelineStore = new TimeLineStore(this);
    this.projectDetails = new ProjectStore(this);
    this.teamspaceRoot = new TeamspaceRootStore(this);
    this.customersStore = new CustomerStore(this);
    this.customerPropertiesStore = new CustomerProperties(this);
    // project members activity
    this.projectMembersActivityStore = new ProjectMembersActivityStore(this);
    this.projectView = new ProjectViewStore(this);
    this.globalView = new GlobalViewStore(this);
    // importers
    this.jiraImporter = new JiraStore(this);
    this.csvImporter = new CSVImporterStore(this);
    this.jiraServerImporter = new JiraServerStore(this);
    this.linearImporter = new LinearStore(this);
    this.asanaImporter = new AsanaStore(this);
    this.flatfileImporter = new FlatfileStore(this);
    this.clickupImporter = new ClickUpStore(this);
    this.notionImporter = new ZipImporterStore(this, EZipDriverType.NOTION);
    this.confluenceImporter = new ZipImporterStore(this, EZipDriverType.CONFLUENCE);
    // integrations
    this.connections = new ConnectionStore(this);
    this.slackIntegration = new SlackStore(this);
    this.githubIntegration = new GithubStore(this);
    this.githubEnterpriseIntegration = new GithubEnterpriseStore(this);
    this.gitlabIntegration = new GitlabStore(this);
    this.gitlabEnterpriseIntegration = new GitlabEnterpriseStore(this);
    this.sentryIntegration = new SentryStore(this);
    this.initiativeFilterStore = new InitiativeFilterStore(this);
    this.initiativeStore = new InitiativeStore(this, this.initiativeFilterStore);
    // dashboards
    this.baseDashboards = new BaseDashboardsStore(this);
    // epics
    this.epicAnalytics = new EpicAnalytics(this);
    // marketplace
    this.applicationStore = new ApplicationStore(this);
    // templates
    this.templatesRoot = new TemplatesRootStore(this);
    // recurring work items
    this.recurringWorkItemsRoot = new RecurringWorkItemsRootStore(this);
    // automations
    this.automationsRoot = new AutomationsRootStore(this);
    // milestones
    this.milestone = new MilestoneStore(this);
    // intake type forms
    this.intakeTypeForms = new IntakeTypeFormStore(this);
    // intake responsibility
    this.intakeResponsibility = new IntakeResponsibilityStore(this);
  }
}
