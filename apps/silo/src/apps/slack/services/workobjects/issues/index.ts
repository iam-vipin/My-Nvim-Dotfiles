import type { TWorkObjectType } from "@/apps/slack/types/workobjects";
import { IssueDetailService } from "./issue-details.service";
import { IssueWorkObjectService } from "./issue-wo.service";
import { IssueWorkObjectViewService } from "./issue-wo-view.service";

export const getIssueWorkObjectService = (
  type: TWorkObjectType,
  teamId: string,
  userId: string
): IssueWorkObjectService => {
  const issueDetailService = new IssueDetailService(type);
  const issueWorkObjectViewService = new IssueWorkObjectViewService(type);

  return new IssueWorkObjectService(
    {
      slackTeamId: teamId,
      slackUserId: userId,
    },
    issueDetailService,
    issueWorkObjectViewService
  );
};
