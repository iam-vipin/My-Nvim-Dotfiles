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

import { cn } from "@plane/utils";

type TSidebarNavItem = {
  className?: string;
  isActive?: boolean;
  children?: React.ReactNode;
};

export function SidebarNavItem(props: TSidebarNavItem) {
  const { className, isActive, children } = props;
  return (
    <div
      className={cn(
        "cursor-pointer relative group w-full flex items-center justify-between gap-1.5 rounded-md px-2 py-1 outline-none",
        {
          "text-primary !bg-layer-transparent-active": isActive,
          "text-secondary hover:bg-layer-transparent-hover active:bg-layer-transparent-active": !isActive,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
