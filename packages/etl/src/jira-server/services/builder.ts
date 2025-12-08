import type { JiraProps } from "..";
import { JiraV2Service } from "..";

export const createJiraService = (props: JiraProps): JiraV2Service => new JiraV2Service(props);
