// services
import axios from "axios";
import type { Paginated } from "jira.js";
import { Board as BoardClient } from "jira.js/out/agile";
import type { Board } from "jira.js/out/agile/models";
import { Version2Client } from "jira.js/out/version2";
import type {
  CustomFieldContextOption,
  FieldDetails,
  Issue,
  IssueTypeDetails,
  JiraStatus,
  Project,
} from "jira.js/out/version2/models";
import type { JiraCustomFieldWithCtx } from "@/jira-server/types/custom-fields";
import type { JiraApiUser, JiraProps } from "..";
import { fetchPaginatedData } from "..";

export class JiraV2Service {
  private jiraClient: Version2Client;
  private hostname: string;
  private patToken: string;

  constructor(props: JiraProps) {
    this.hostname = props.hostname;
    this.patToken = props.patToken;

    this.jiraClient = new Version2Client({
      host: props.hostname,
      authentication: {
        personalAccessToken: props.patToken,
      },
    });
  }

  async getServerInfo() {
    return this.jiraClient.serverInfo.getServerInfo();
  }

  // Verified
  async getCurrentUser() {
    return await this.jiraClient.myself.getCurrentUser();
  }

  async getJiraUsers(): Promise<JiraApiUser[]> {
    // @ts-expect-error
    return (await this.jiraClient.userSearch.findUsers({
      username: ".",
      // @ts-expect-error
      includeActive: true,
    })) as JiraApiUser[];
  }

  // Verified
  async getNumberOfIssues(projectKey: string) {
    const issues = await this.jiraClient.issueSearch.searchForIssuesUsingJql({
      jql: `project = "${projectKey}"`,
      maxResults: 0,
    });
    return issues.total;
  }

  // Verified
  async getIssueFields() {
    return this.jiraClient.issueFields.getFields();
  }

  // Verified
  async getResourceStatuses() {
    const response = await axios.get(`${this.hostname}/rest/api/2/status`, {
      headers: {
        Authorization: `Bearer ${this.patToken}`,
      },
    });

    const data = response.data as JiraStatus[];
    return data;
  }

  // Verified
  async getProjectStatuses(projectId: string) {
    try {
      return await fetchPaginatedData<JiraStatus>((startAt) =>
        axios
          .get(`${this.hostname}/rest/api/2/status/page?projectIds=${projectId}&startAt=${startAt}`, {
            headers: {
              Authorization: `Bearer ${this.patToken}`,
            },
          })
          .then((res) => res.data as Paginated<JiraStatus>)
      );
    } catch (e) {
      console.error("error getProjectStatuses", e);
      throw e;
    }
  }

  // Verified
  async getFields() {
    return this.jiraClient.issueFields.getFields();
  }

  // Verified
  async getProjectComponents(projectId: string) {
    return this.jiraClient.projectComponents.getProjectComponents({
      projectIdOrKey: projectId,
    });
  }

  // Verified
  async getProjectComponentIssues(componentId: string) {
    return this.jiraClient.issueSearch.searchForIssuesUsingJql({
      jql: `component = "${componentId}"`,
    });
  }

  // Verified
  async getBoardSprints(boardId: number) {
    const board = new BoardClient(this.jiraClient);
    return board.getAllSprints({
      boardId: boardId,
    });
  }

  // Verified
  async getBoardSprintsIssues(boardId: number, sprintId: number, startAt: number) {
    const board = new BoardClient(this.jiraClient);
    return board.getBoardIssuesForSprint({
      boardId: boardId,
      sprintId: sprintId,
      startAt: startAt,
    });
  }

  // Verified
  async getBoardEpics(boardId: number) {
    const board = new BoardClient(this.jiraClient);
    return board.getEpics({
      boardId: boardId,
    });
  }

  // Verified
  async getProjectBoards(projectId: string) {
    const board = new BoardClient(this.jiraClient);

    try {
      return await fetchPaginatedData<Board>((startAt) =>
        board.getAllBoards({
          projectKeyOrId: projectId,
          startAt: startAt,
        })
      );
    } catch (e) {
      console.error("error getProjectBoards", e);
      throw e;
    }
  }

  // Verified
  async getIssuePriorities() {
    return this.jiraClient.issuePriorities.getPriorities();
  }

  // Verified
  async getAllProjectLabels(projectId: string) {
    try {
      const allLabels = await fetchPaginatedData<string>((startAt) => this.getProjectLabels(projectId, startAt));
      return Array.from(new Set(allLabels));
    } catch (error) {
      console.error("error getAllProjectLabels", error);
      return [];
    }
  }

  // Verified
  async getProjectLabels(projectId: string, startAt = 0) {
    const response = await axios.get(`${this.hostname}/rest/api/2/search`, {
      params: {
        jql: `project = "${projectId}" AND labels is not EMPTY`,
        fields: ["labels"],
        startAt: startAt,
        maxResults: 1000,
      },
      headers: {
        Authorization: `Bearer ${this.patToken}`,
      },
    });

    const data = response.data;
    const issues = data.issues as Issue[];
    // eslint-disable-next-line no-undef
    const allLabels = new Set();
    issues.forEach((issue) => {
      if (issue.fields.labels) {
        issue.fields.labels.forEach((label) => allLabels.add(label));
      }
    });

    return {
      values: Array.from(allLabels) as string[],
      total: data.total,
      maxResults: data.maxResults || issues.length,
      isLast: data.total ? startAt + issues.length >= data.total : issues.length === 0,
    };
  }

  // Verified
  async getResourceProjects(key: string = ""): Promise<Project[]> {
    return this.jiraClient.projects.getProject({
      projectIdOrKey: key,
    });
  }

  // Verified
  async getProjectIssueTypes(projectId: string) {
    try {
      return await fetchPaginatedData<IssueTypeDetails>((startAt) =>
        axios
          .get(`${this.hostname}/rest/api/2/issuetype/page?projectIds=${projectId}&startAt=${startAt}`, {
            headers: {
              Authorization: `Bearer ${this.patToken}`,
            },
          })
          .then((res) => res.data as Paginated<IssueTypeDetails>)
      );
    } catch (e) {
      console.error("error getProjectIssueTypes", e);
      throw e;
    }
  }

  // Verified
  async getCustomFields() {
    const fields: FieldDetails[] = await this.jiraClient.issueFields.getFields();
    const customFields: FieldDetails[] = fields.filter((field) => field.custom === true);
    return customFields;
  }

  async getCustomFieldsWithContext(projectId?: string) {
    try {
      return await fetchPaginatedData<JiraCustomFieldWithCtx>((startAt) =>
        axios
          .get(`${this.hostname}/rest/api/2/customFields?startAt=${startAt}&projectIds=${projectId ?? ""}`, {
            headers: {
              Authorization: `Bearer ${this.patToken}`,
            },
          })
          .then((res) => res.data as Paginated<JiraCustomFieldWithCtx>)
      );
    } catch (e) {
      console.error("error getCustomFieldsWithContext", e);
      throw e;
    }
  }

  async getProjectFieldContexts(fieldId: string, startAt = 0) {
    return this.jiraClient.issueCustomFieldContexts.getProjectContextMapping({
      fieldId: fieldId,
      startAt: startAt,
    });
  }

  async getIssueTypeFieldContexts(fieldId: string, contextIds: number[], startAt = 0) {
    return this.jiraClient.issueCustomFieldContexts.getIssueTypeMappingsForContexts({
      fieldId: fieldId,
      contextId: contextIds,
      startAt: startAt,
    });
  }

  async getIssueFieldOptions(fieldId: string, projectId: string, issueTypeId: string) {
    const response = await axios.get(`${this.hostname}/rest/api/2/customFields/${fieldId}/options`, {
      params: {
        projectIds: projectId,
        issueTypeIds: issueTypeId,
      },
      headers: {
        Authorization: `Bearer ${this.patToken}`,
      },
    });

    const data = response.data;
    const options = data.options as CustomFieldContextOption[];

    return options;
  }

  async getProjectIssueCreateMeta(projectId: string) {
    return this.jiraClient.issues.getCreateIssueMeta({
      projectIds: [projectId],
      expand: "projects.issuetypes.fields",
    });
  }

  async getProjectIssues(projectKey: string, startAt = 0, createdAfter?: string) {
    return this.jiraClient.issueSearch.searchForIssuesUsingJql({
      jql: createdAfter
        ? `project = "${projectKey}" AND (created >= "${createdAfter}" OR updated >= "${createdAfter}")`
        : `project = "${projectKey}"`,
      expand: "renderedFields",
      fields: ["*all"],
      startAt,
    });
  }

  async getAllLabels() {
    return await fetchPaginatedData<string>((startAt) =>
      this.jiraClient.labels.getAllLabels({
        startAt,
        maxResults: 1000,
      })
    );
  }

  async getNumberOfLabels() {
    const labels = await this.jiraClient.labels.getAllLabels();
    return labels.total;
  }

  async getProjectUsers(projectKey: string) {
    return this.jiraClient.userSearch.findAssignableUsers({
      project: projectKey,
    });
  }

  async getIssueComments(issueId: string, startAt: number) {
    return await this.jiraClient.issueComments.getComments({
      issueIdOrKey: issueId,
      startAt: startAt,
      expand: "renderedBody",
    });
  }
}

export default JiraV2Service;
