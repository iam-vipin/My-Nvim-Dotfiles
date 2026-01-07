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

import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { applyCustomTheme } from "@plane/utils";
// components
import { PreferencesList } from "@/components/appearance/list";
import { LogoSpinner } from "@/components/common/logo-spinner";
import { PageHead } from "@/components/core/page-title";
import { ProfileSettingContentHeader } from "@/components/profile/profile-setting-content-header";
import { ProfileSettingContentWrapper } from "@/components/profile/profile-setting-content-wrapper";
import { StartOfWeekPreference } from "@/components/profile/start-of-week-preference";

// hooks
import { useUserProfile } from "@/hooks/store/user";

function ProfileAppearancePage() {
  const { t } = useTranslation();
  // hooks
  const { data: userProfile } = useUserProfile();

  return (
    <>
      <PageHead title="Profile - Preferences" />
      {userProfile ? (
        <ProfileSettingContentWrapper>
          <ProfileSettingContentHeader title={t("appearance")} />
          <PreferencesList />
          <StartOfWeekPreference option={{ title: "Start of week", description: "Select the start of the week" }} />
        </ProfileSettingContentWrapper>
      ) : (
        <div className="grid h-full w-full place-items-center px-4 sm:px-0">
          <LogoSpinner />
        </div>
      )}
    </>
  );
}

export default observer(ProfileAppearancePage);
