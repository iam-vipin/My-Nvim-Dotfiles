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

export enum E_INTEGRATION_KEYS {
  GITHUB = "GITHUB",
  GITHUB_ENTERPRISE = "GITHUB_ENTERPRISE",
  GITLAB = "GITLAB",
  SLACK = "SLACK",
}

export type TUserConnection =
  | E_INTEGRATION_KEYS.GITHUB
  | E_INTEGRATION_KEYS.SLACK
  | E_INTEGRATION_KEYS.GITHUB_ENTERPRISE;

export type TPersonalAccountProvider = {
  key: TUserConnection;
  name: string;
  description: string;
};

export const USER_CONNECTION_PROVIDERS: Record<TUserConnection, TPersonalAccountProvider> = {
  GITHUB: {
    key: E_INTEGRATION_KEYS.GITHUB,
    name: "GitHub",
    description: "Connect your GitHub account to Plane to get the most out of your development workflow.",
  },
  SLACK: {
    key: E_INTEGRATION_KEYS.SLACK,
    name: "Slack",
    description:
      "Connect your Slack account to Plane to get the most out of your team collaboration and communication.",
  },
  GITHUB_ENTERPRISE: {
    key: E_INTEGRATION_KEYS.GITHUB_ENTERPRISE,
    name: "GitHub Enterprise",
    description: "Connect your GitHub Enterprise account to Plane to get the most out of your development workflow.",
  },
} as const;

export const EXTENDED_PREFERENCE_OPTIONS: {
  id: string;
  title: string;
  description: string;
}[] = [
  {
    id: "smooth_cursor",
    title: "smooth_cursor",
    description: "select_the_cursor_motion_style_that_feels_right_for_you",
  },
];
