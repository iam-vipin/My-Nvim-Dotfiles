import { E_IMPORTER_KEYS } from "@plane/etl/core";
import {
  // Pre-run steps
  PlaneProjectConfigurationStep,
  // Entity steps
  JiraBoardsStep,
  JiraCyclesStep,
  JiraDefaultPropertiesStep,
  JiraIssuePropertyOptionsStep,
  JiraModulesStep,
  WaitForCeleryStep,
  // Association steps
  JiraRelationsStep,
} from "../shared";
import { JiraCloudUserStep, JiraCloudIssuePropertiesStep, JiraCloudIssueTypesStep } from "./entities";
import { JiraCloudIssuesStep } from "./issues";

const JIRA_CLOUD_STEPS = [
  // Pre-run steps
  new PlaneProjectConfigurationStep(),
  // Entity steps
  new JiraCloudUserStep(),
  new JiraModulesStep(E_IMPORTER_KEYS.JIRA),
  new JiraBoardsStep(),
  new JiraCyclesStep(E_IMPORTER_KEYS.JIRA),
  new JiraCloudIssueTypesStep(E_IMPORTER_KEYS.JIRA),
  new JiraCloudIssuePropertiesStep(E_IMPORTER_KEYS.JIRA),
  new JiraDefaultPropertiesStep(E_IMPORTER_KEYS.JIRA),
  new JiraIssuePropertyOptionsStep(E_IMPORTER_KEYS.JIRA),
  // Issue steps
  new JiraCloudIssuesStep(E_IMPORTER_KEYS.JIRA),
  new WaitForCeleryStep(),
  // Association steps
  new JiraRelationsStep(E_IMPORTER_KEYS.JIRA),
];

export default JIRA_CLOUD_STEPS;
