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

import { store } from "@/lib/store-context";
import { E_FEATURE_FLAGS } from "@plane/constants";

export type TRenderSettingsLink = (workspaceSlug: string, settingKey: string) => boolean;

export const shouldRenderSettingLink: TRenderSettingsLink = (workspaceSlug, settingKey) => {
  const isApplicationsEnabled = store.featureFlags.getFeatureFlag(workspaceSlug, E_FEATURE_FLAGS.APPLICATIONS, false);
  const isPiChatEnabled = store.featureFlags.getFeatureFlag(workspaceSlug, E_FEATURE_FLAGS.PI_CHAT, false);
  const isEditorOPSEnabled = store.featureFlags.getFeatureFlag(workspaceSlug, E_FEATURE_FLAGS.EDITOR_AI_OPS, false);
  const isPiDedupeEnabled = store.featureFlags.getFeatureFlag(workspaceSlug, E_FEATURE_FLAGS.PI_DEDUPE, false);
  const isWorkspaceAccessTokensEnables = store.featureFlags.getFeatureFlag(
    workspaceSlug,
    E_FEATURE_FLAGS.WORKSPACE_API_TOKEN,
    false
  );
  // Cloud SSO is enabled if the instance is not self-managed (i.e cloud only)
  const isCloudSSOEnabled = store.instance.config?.is_self_managed === false ? true : false;
  switch (settingKey) {
    case "applications":
      return isApplicationsEnabled;
    case "plane-intelligence":
      return isPiChatEnabled || isEditorOPSEnabled || isPiDedupeEnabled;
    case "identity":
      return isCloudSSOEnabled;
    case "access-tokens":
      return isWorkspaceAccessTokensEnables;
    default:
      return true;
  }
};
