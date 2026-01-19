export const getGitlabUploadsPrefix = (gitlabProjectId: string, gitlabBaseUrl: string = "https://gitlab.com") => {
  return `${gitlabBaseUrl}/api/v4/projects/${gitlabProjectId}`;
};
