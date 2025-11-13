import type { ClickupAPIService } from "@plane/etl/clickup";
import { E_IMPORTER_KEYS } from "@plane/etl/core";
import type { Client } from "@plane/sdk";
import { ContentParser } from "@/lib/parser";
import { ExternalFileParserExtension } from "@/lib/parser/extensions/external/file-parser";
import { ExternalImageParserExtension } from "@/lib/parser/extensions/external/image-parser";

export type ClickUpContentParserConfig = {
  planeClient: Client;
  clickupService: ClickupAPIService;
  workspaceSlug: string;
  projectId: string;
  fileDownloadHeaders: Record<string, string>;
  apiBaseUrl: string;
  appBaseUrl?: string;
  userMap: Map<string, string>;
};

export const getClickUpContentParser = (config: ClickUpContentParserConfig) => {
  const fileHelperConfig = {
    planeClient: config.planeClient,
    workspaceSlug: config.workspaceSlug,
    projectId: config.projectId,
    externalSource: E_IMPORTER_KEYS.CLICKUP,
    fileDownloadHeaders: config.fileDownloadHeaders,
  };

  const imageParserExtension = new ExternalImageParserExtension({
    ...fileHelperConfig,
  });

  const fileParserExtension = new ExternalFileParserExtension({
    ...fileHelperConfig,
    apiBaseUrl: config.apiBaseUrl,
    downloadableUrlPrefix: "https://t",
  });

  return new ContentParser([imageParserExtension, fileParserExtension]);
};
