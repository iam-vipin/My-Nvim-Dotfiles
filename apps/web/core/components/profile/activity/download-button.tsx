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

import { useState } from "react";
import { useParams } from "next/navigation";
// services
// ui
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
// helpers
import { renderFormattedPayloadDate } from "@plane/utils";
import { UserService } from "@/services/user.service";

const userService = new UserService();

export function DownloadActivityButton() {
  // states
  const [isDownloading, setIsDownloading] = useState(false);
  // router
  const { workspaceSlug, userId } = useParams();
  //hooks
  const { t } = useTranslation();

  const handleDownload = async () => {
    const today = renderFormattedPayloadDate(new Date());

    if (!workspaceSlug || !userId || !today) return;

    setIsDownloading(true);

    const csv = await userService
      .downloadProfileActivity(workspaceSlug.toString(), userId.toString(), {
        date: today,
      })
      .finally(() => setIsDownloading(false));

    // create a Blob object
    const blob = new Blob([csv], { type: "text/csv" });

    // create URL for the Blob object
    const url = window.URL.createObjectURL(blob);

    // create a link element
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-activity-${Date.now()}.csv`;
    document.body.appendChild(a);

    // simulate click on the link element to trigger download
    a.click();

    // cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Button onClick={handleDownload} loading={isDownloading}>
      {isDownloading ? t("profile.stats.recent_activity.button_loading") : t("profile.stats.recent_activity.button")}
    </Button>
  );
}
