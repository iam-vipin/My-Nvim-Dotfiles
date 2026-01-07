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
// components
import { LogoSpinner } from "@/components/common/logo-spinner";
import { PageHead } from "@/components/core/page-title";
import { ProfileForm } from "@/components/profile/form";
import { ProfileSettingContentWrapper } from "@/components/profile/profile-setting-content-wrapper";
// hooks
import { useUser } from "@/hooks/store/user";

function ProfileSettingsPage() {
  const { t } = useTranslation();
  // store hooks
  const { data: currentUser, userProfile } = useUser();

  if (!currentUser)
    return (
      <div className="grid h-full w-full place-items-center px-4 sm:px-0">
        <LogoSpinner />
      </div>
    );

  return (
    <>
      <PageHead title={`${t("profile.label")} - ${t("general_settings")}`} />
      <ProfileSettingContentWrapper>
        <ProfileForm user={currentUser} profile={userProfile.data} />
      </ProfileSettingContentWrapper>
    </>
  );
}

export default observer(ProfileSettingsPage);
