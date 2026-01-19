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

import type { FC } from "react";
// helpers
import { useTranslation } from "@plane/i18n";
import { cn } from "@plane/utils";

type TUpgradeBadge = {
  className?: string;
  size?: "sm" | "md";
};

export function UpgradeBadge(props: TUpgradeBadge) {
  const { className, size = "sm" } = props;

  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "w-fit cursor-pointer rounded-2xl text-accent-secondary bg-accent-primary/20 text-center font-medium outline-none",
        {
          "text-13 px-3": size === "md",
          "text-11 px-2": size === "sm",
        },
        className
      )}
    >
      {t("sidebar.pro")}
    </div>
  );
}
