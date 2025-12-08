import type { TGithubWorkspaceConnectionConfig } from "../integration/github";
import type { TGitlabWorkspaceConnectionConfig } from "../integration/gitlab";
import type { TSlackWorkspaceConnectionConfig } from "../integration/slack";

export type TWorkspaceConnectionConfig =
  | TGithubWorkspaceConnectionConfig
  | TGitlabWorkspaceConnectionConfig
  | TSlackWorkspaceConnectionConfig;
