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
import { useTranslation } from "@plane/i18n";
// components
import { PageHead } from "@/components/core/page-title";
// hooks
import { useUser } from "@/hooks/store/user";
// local imports
import { GeneralProfileSettingsForm } from "./form";

export const GeneralProfileSettings = observer(function GeneralProfileSettings() {
  const { t } = useTranslation();
  // store hooks
  const { data: currentUser, userProfile } = useUser();

  if (!currentUser) return null;

  return (
    <>
      <PageHead title={`${t("profile.label")} - ${t("general_settings")}`} />
      <GeneralProfileSettingsForm user={currentUser} profile={userProfile.data} />
    </>
  );
});
