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

import React from "react";
// plane package imports
import { useTranslation } from "@plane/i18n";
import { cn } from "@plane/utils";

type Props = {
  i18nTitle: string;
  children: React.ReactNode;
  className?: string;
};

function AnalyticsWrapper(props: Props) {
  const { i18nTitle, children, className } = props;
  const { t } = useTranslation();
  return (
    <div className={cn("px-6 py-4", className)}>
      <h1 className={"mb-4 text-20 font-bold md:mb-6"}>{t(i18nTitle)}</h1>
      {children}
    </div>
  );
}

export default AnalyticsWrapper;
