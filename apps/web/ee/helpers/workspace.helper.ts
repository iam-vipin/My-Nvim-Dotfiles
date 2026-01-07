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

import { E_FEATURE_FLAGS } from "@plane/constants";
import type { TRenderSettingsLink } from "@/ce/helpers/workspace.helper";
import { store } from "@/lib/store-context";

export const shouldRenderSettingLink: TRenderSettingsLink = (workspaceSlug, settingKey) => {
  const isApplicationsEnabled = store.featureFlags.getFeatureFlag(workspaceSlug, E_FEATURE_FLAGS.APPLICATIONS, false);
  const isPiChatEnabled = store.featureFlags.getFeatureFlag(workspaceSlug, E_FEATURE_FLAGS.PI_CHAT, false);
  const isEditorOPSEnabled = store.featureFlags.getFeatureFlag(workspaceSlug, E_FEATURE_FLAGS.EDITOR_AI_OPS, false);
  const isPiDedupeEnabled = store.featureFlags.getFeatureFlag(workspaceSlug, E_FEATURE_FLAGS.PI_DEDUPE, false);
  // Cloud SSO is enabled if the instance is not self-managed (i.e cloud only)
  const isCloudSSOEnabled = store.instance.config?.is_self_managed === false ? true : false;
  switch (settingKey) {
    case "applications":
      return isApplicationsEnabled;
    case "plane-intelligence":
      return isPiChatEnabled || isEditorOPSEnabled || isPiDedupeEnabled;
    case "identity":
      return isCloudSSOEnabled;
    default:
      return true;
  }
};
