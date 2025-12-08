import type { TGithubWorkspaceConnectionConfig } from "../integration/github";
import type { TGitlabWorkspaceConnectionConfig } from "../integration/gitlab";

export type TWorkspaceConnectionConfig = TGithubWorkspaceConnectionConfig | TGitlabWorkspaceConnectionConfig;
