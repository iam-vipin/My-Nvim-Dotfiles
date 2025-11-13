import type { TGithubWorkspaceConnectionData } from "../integration/github";
import type { TGitlabWorkspaceConnectionData } from "../integration/gitlab";
import type { TSlackWorkspaceConnectionData } from "../integration/slack";

export type TWorkspaceConnectionData =
  | TGithubWorkspaceConnectionData
  | TGitlabWorkspaceConnectionData
  | TSlackWorkspaceConnectionData;
