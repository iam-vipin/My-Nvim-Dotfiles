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
import { useParams } from "next/navigation";
// components
import { useTranslation } from "@plane/i18n";
import { EmptyStateDetailed } from "@plane/propel/empty-state";

// TODO: If projectViewId changes, everything breaks. Figure out a better way to handle this.
export const ProfileViewEmptyState = observer(function ProfileViewEmptyState() {
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { profileViewId } = useParams();

  if (!profileViewId) return null;

  return (
    <EmptyStateDetailed
      assetKey="work-item"
      title={t(`profile.empty_state.${profileViewId.toString()}.title`)}
      description={t(`profile.empty_state.${profileViewId.toString()}.description`)}
    />
  );
});
