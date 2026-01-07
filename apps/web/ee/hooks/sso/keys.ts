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

export const LIST_DOMAINS_KEY = (workspaceSlug: string) => `SSO_DOMAINS_${workspaceSlug}`;
export const LIST_PROVIDERS_KEY = (workspaceSlug: string) => `SSO_PROVIDERS_${workspaceSlug}`;
export const GET_DOMAIN_KEY = (workspaceSlug: string, domainId: string) => `SSO_DOMAIN_${workspaceSlug}_${domainId}`;
export const GET_PROVIDER_KEY = (workspaceSlug: string, providerId: string) =>
  `SSO_PROVIDER_${workspaceSlug}_${providerId}`;
