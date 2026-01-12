export const getSlackIssueIdentityKey = (projectId: string, issueId: string): string => {
  return `${projectId}:${issueId}`;
};
