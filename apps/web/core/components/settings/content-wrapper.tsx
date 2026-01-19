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

import type { ReactNode } from "react";
import { observer } from "mobx-react";
import { cn } from "@plane/utils";

type TProps = {
  children: ReactNode;
  size?: "lg" | "md";
};
export const SettingsContentWrapper = observer(function SettingsContentWrapper(props: TProps) {
  const { children, size = "md" } = props;

  return (
    <div
      className={cn("flex flex-col w-full items-center mx-auto py-4 md:py-0", {
        "md:px-4 max-w-[800px] 2xl:max-w-[1000px]": size === "md",
        "md:px-16": size === "lg",
      })}
    >
      <div className="pb-10 w-full">{children}</div>
    </div>
  );
});
