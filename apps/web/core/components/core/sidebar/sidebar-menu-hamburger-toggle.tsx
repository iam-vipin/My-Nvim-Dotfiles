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
import { PanelRight } from "lucide-react";
import { useAppTheme } from "@/hooks/store/use-app-theme";

export const SidebarHamburgerToggle = observer(function SidebarHamburgerToggle() {
  // store hooks
  const { toggleSidebar } = useAppTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSidebar();
  };

  return (
    <button
      type="button"
      className="group flex-shrink-0 size-7 grid place-items-center rounded-sm hover:bg-layer-1 transition-all bg-surface-2"
      onClick={handleClick}
    >
      <PanelRight className="size-3.5 text-secondary transition-all group-hover:text-primary" />
    </button>
  );
});
