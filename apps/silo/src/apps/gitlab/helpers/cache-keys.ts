export const GITLAB_ISSUE_CACHE_KEY = (projectId: string, issueId: string) => `silo:gl:issue:${projectId}:${issueId}`;
export const GITLAB_ISSUE_COMMENT_CACHE_KEY = (projectId: string, issueId: string, commentId: string) =>
  `silo:gl:issue:comment:${projectId}:${issueId}:${commentId}`;

export const PLANE_GITLAB_ISSUE_CACHE_KEY = (issueId: string) => `silo:plane:gl:issue:${issueId}`;
export const PLANE_GITLAB_ISSUE_COMMENT_CACHE_KEY = (commentId: string) => `silo:plane:gl:issue:comment:${commentId}`;

export const GITLAB_ISSUE_EXTERNAL_ID = (gitlabProjectId: string, gitlabIssueId: string) =>
  `gl_${gitlabProjectId}_${gitlabIssueId}`;
