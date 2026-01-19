/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

export type TGithubIntegrationConfig = {
  GITHUB_APP_NAME: string;
  GITHUB_APP_ID: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_PRIVATE_KEY: string;
};

export type TGitlabIntegrationConfig = {
  GITLAB_CLIENT_ID: string;
  GITLAB_CLIENT_SECRET: string;
};

export type TSlackIntegrationConfig = {
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
};

export type TIntegrationConfig = {
  github?: TGithubIntegrationConfig;
  gitlab?: TGitlabIntegrationConfig;
  slack?: TSlackIntegrationConfig;
};
