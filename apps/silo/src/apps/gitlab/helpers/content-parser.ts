import { ContentParser, ExternalFileParserExtension, ExternalImageParserExtension } from "@/lib/parser";
import { E_INTEGRATION_KEYS } from "@plane/types";
import type { GitLabService } from "@plane/etl/gitlab";
import type { Client } from "@plane/sdk";

export type GitlabContentParserConfig = {
  planeClient: Client;
  gitlabService: GitLabService;
  workspaceSlug: string;
  projectId: string;
  fileDownloadHeaders: Record<string, string>;
  apiBaseUrl: string;
  userMap: Map<string, string>;
};

export const getGitlabContentParser = (config: GitlabContentParserConfig, isEnterprise: boolean, urlPrefix: string) => {
  const fileHelperConfig = {
    planeClient: config.planeClient,
    workspaceSlug: config.workspaceSlug,
    projectId: config.projectId,
    externalSource: isEnterprise ? E_INTEGRATION_KEYS.GITLAB_ENTERPRISE : E_INTEGRATION_KEYS.GITLAB,
    fileDownloadHeaders: config.fileDownloadHeaders,
  };

  const imageParserExtension = new ExternalImageParserExtension({
    ...fileHelperConfig,
  });

  const fileParserExtension = new ExternalFileParserExtension({
    ...fileHelperConfig,
    apiBaseUrl: config.apiBaseUrl,
    downloadableUrlPrefix: !isEnterprise ? "https://uploads.gitlab.com" : urlPrefix,
  });

  return new ContentParser([imageParserExtension, fileParserExtension]);
};
