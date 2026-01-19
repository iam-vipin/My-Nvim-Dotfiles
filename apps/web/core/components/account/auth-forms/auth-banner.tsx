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

// plane imports
import { InfoIcon, CloseIcon } from "@plane/propel/icons";
import { useTranslation } from "@plane/i18n";
// helpers
import type React from "react";

type TAuthBanner = {
  message: React.ReactNode;
  handleBannerData?: (bannerData: undefined) => void;
};

export function AuthBanner(props: TAuthBanner) {
  const { message, handleBannerData } = props;
  // translation
  const { t } = useTranslation();

  if (!message) return <></>;
  return (
    <div
      role="alert"
      className="relative flex items-center p-2 rounded-md gap-2 border border-accent-strong/50 bg-accent-primary/10"
    >
      <div className="size-4 flex-shrink-0 grid place-items-center">
        <InfoIcon width={16} height={16} className="text-accent-primary" />
      </div>
      <p className="w-full text-13 font-medium text-accent-primary">{message}</p>
      <button
        type="button"
        className="relative ml-auto size-6 rounded-xs grid place-items-center transition-all hover:bg-accent-primary/20 text-accent-primary/80"
        onClick={() => handleBannerData?.(undefined)}
        aria-label={t("aria_labels.auth_forms.close_alert")}
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  );
}
