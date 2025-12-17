import type { MQ, Store } from "@/worker/base";
import { JiraImportOrchestrator } from "./orchestrator";
import JIRA_CLOUD_STEPS from "./steps/cloud";
import JIRA_SERVER_STEPS from "./steps/server";

export const getJiraCloudImportOrchestrator = (mq: MQ, store: Store) =>
  new JiraImportOrchestrator(mq, store, JIRA_CLOUD_STEPS);

export const getJiraServerImportOrchestrator = (mq: MQ, store: Store) =>
  new JiraImportOrchestrator(mq, store, JIRA_SERVER_STEPS);
