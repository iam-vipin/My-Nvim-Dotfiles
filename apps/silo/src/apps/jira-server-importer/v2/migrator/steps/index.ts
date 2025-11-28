import {
  JiraServerUsersStep,
  JiraServerModulesStep,
  JiraServerBoardsStep,
  JiraServerCyclesStep,
  JiraServerIssueTypesStep,
  JiraServerIssuePropertiesStep,
  JiraServerDefaultPropertiesStep,
  JiraServerIssuePropertyOptionsStep,
} from "./entities";
import { JiraServerIssuesStep, WaitForCeleryStep } from "./issues";
import { PlaneProjectConfigurationStep } from "./pre-run";
import { JiraServerRelationsStep } from "./relations";

const JIRA_SERVER_STEPS = [
  // Pre-run steps
  new PlaneProjectConfigurationStep(),
  // Entity steps
  new JiraServerUsersStep(),
  new JiraServerModulesStep(),
  new JiraServerBoardsStep(),
  new JiraServerCyclesStep(),
  new JiraServerIssueTypesStep(),
  new JiraServerIssuePropertiesStep(),
  new JiraServerDefaultPropertiesStep(),
  new JiraServerIssuePropertyOptionsStep(),
  // Issue steps
  new JiraServerIssuesStep(),
  new WaitForCeleryStep(),
  // Association steps
  new JiraServerRelationsStep(),
];

export default JIRA_SERVER_STEPS;
