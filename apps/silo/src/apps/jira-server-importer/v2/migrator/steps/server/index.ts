import { E_IMPORTER_KEYS } from "@plane/etl/core";
import {
  // Pre-run steps
  PlaneProjectConfigurationStep,
  // Entity steps
  JiraBoardsStep,
  JiraCyclesStep,
  JiraDefaultPropertiesStep,
  JiraIssuePropertiesStep,
  JiraIssuePropertyOptionsStep,
  JiraIssueTypesStep,
  JiraModulesStep,
  JiraUsersStep,
  // Issue steps
  JiraIssuesStep,
  WaitForCeleryStep,
  // Association steps
  JiraRelationsStep,
} from "../shared";

const JIRA_SERVER_STEPS = [
  // Pre-run steps
  new PlaneProjectConfigurationStep(),
  // Entity steps
  new JiraUsersStep(),
  new JiraModulesStep(E_IMPORTER_KEYS.JIRA_SERVER),
  new JiraBoardsStep(),
  new JiraCyclesStep(E_IMPORTER_KEYS.JIRA_SERVER),
  new JiraIssueTypesStep(E_IMPORTER_KEYS.JIRA_SERVER),
  new JiraIssuePropertiesStep(E_IMPORTER_KEYS.JIRA_SERVER),
  new JiraDefaultPropertiesStep(E_IMPORTER_KEYS.JIRA_SERVER),
  new JiraIssuePropertyOptionsStep(E_IMPORTER_KEYS.JIRA_SERVER),
  // Issue steps
  new JiraIssuesStep(E_IMPORTER_KEYS.JIRA_SERVER),
  new WaitForCeleryStep(),
  // Association steps
  new JiraRelationsStep(E_IMPORTER_KEYS.JIRA_SERVER),
];

export default JIRA_SERVER_STEPS;
