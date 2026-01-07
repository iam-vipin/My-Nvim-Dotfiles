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

import { WEBSITE_URL } from "@plane/constants";
// assets
import { PlaneLogo } from "@plane/propel/icons";

type TPoweredBy = {
  disabled?: boolean;
};

export function PoweredBy(props: TPoweredBy) {
  // props
  const { disabled = false } = props;

  if (disabled || !WEBSITE_URL) return null;

  return (
    <a
      href={WEBSITE_URL}
      className="fixed bottom-2.5 right-5 !z-[999999] flex items-center gap-1 rounded-sm border border-subtle bg-layer-3 px-2 py-1 shadow-raised-100"
      target="_blank"
      rel="noreferrer noopener"
    >
      <PlaneLogo className="h-3 w-auto text-primary" />
      <div className="text-11">
        Powered by <span className="font-semibold">Plane Publish</span>
      </div>
    </a>
  );
}
