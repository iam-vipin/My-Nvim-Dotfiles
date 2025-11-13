import type { TGithubEntityConnectionConfig } from "../integration/github";
import type { TGitlabEntityConnectionConfig } from "../integration/gitlab";
import type { TSlackEntityConnectionConfig } from "../integration/slack";

export type TWorkspaceEntityConnectionConfig =
  | TGithubEntityConnectionConfig
  | TGitlabEntityConnectionConfig
  | TSlackEntityConnectionConfig;
