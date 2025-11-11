import { ExCycle, ExIssueLabel } from "@plane/sdk";
import { WebhookGitHubLabel, WebhookGitHubMilestone } from "../types";

export const transformPlaneLabel = (label: ExIssueLabel): Partial<WebhookGitHubLabel> => ({
  name: label.name,
  color: label.color.replace("#", ""),
});

export const transformPlaneCycle = (cycle: ExCycle): Partial<WebhookGitHubMilestone> => ({
  id: parseInt(cycle.external_id || "0"),
  title: cycle.name,
  description: cycle.description,
  created_at: cycle.created_at,
  due_on: cycle.end_date,
});
