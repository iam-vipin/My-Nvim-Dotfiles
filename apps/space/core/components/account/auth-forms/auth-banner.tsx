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

import { InfoIcon, CloseIcon } from "@plane/propel/icons";
// helpers
import type { TAuthErrorInfo } from "@/helpers/authentication.helper";

type TAuthBanner = {
  bannerData: TAuthErrorInfo | undefined;
  handleBannerData?: (bannerData: TAuthErrorInfo | undefined) => void;
};

export function AuthBanner(props: TAuthBanner) {
  const { bannerData, handleBannerData } = props;

  if (!bannerData) return <></>;
  return (
    <div className="relative flex items-center p-2 rounded-md gap-2 border border-accent-strong/50 bg-accent-primary/10">
      <div className="w-4 h-4 flex-shrink-0 relative flex justify-center items-center">
        <InfoIcon width={16} height={16} className="text-accent-primary" />
      </div>
      <div className="w-full text-13 font-medium text-accent-primary">{bannerData?.message}</div>
      <div
        className="relative ml-auto w-6 h-6 rounded-xs flex justify-center items-center transition-all cursor-pointer hover:bg-accent-primary/20 text-accent-primary/80"
        onClick={() => handleBannerData && handleBannerData(undefined)}
      >
        <CloseIcon className="w-4 h-4 flex-shrink-0" />
      </div>
    </div>
  );
}
