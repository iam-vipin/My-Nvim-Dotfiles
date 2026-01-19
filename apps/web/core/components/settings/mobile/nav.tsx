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

import { useRef } from "react";
import { observer } from "mobx-react";
import { Menu } from "lucide-react";
import { useOutsideClickDetector } from "@plane/hooks";
import { useTranslation } from "@plane/i18n";
import { ChevronRightIcon } from "@plane/propel/icons";
import { useUserSettings } from "@/hooks/store/user";

type Props = {
  hamburgerContent: React.ComponentType<{ isMobile: boolean }>;
  activePath: string;
};

export const SettingsMobileNav = observer(function SettingsMobileNav(props: Props) {
  const { hamburgerContent: HamburgerContent, activePath } = props;
  // refs
  const sidebarRef = useRef<HTMLDivElement>(null);
  // store hooks
  const { sidebarCollapsed, toggleSidebar } = useUserSettings();
  const { t } = useTranslation();

  useOutsideClickDetector(sidebarRef, () => {
    if (!sidebarCollapsed) toggleSidebar(true);
  });

  return (
    <div className="md:hidden">
      <div className="border-b border-subtle py-3 flex items-center gap-4">
        <div ref={sidebarRef} className="relative w-fit">
          {!sidebarCollapsed && <HamburgerContent isMobile />}
          <button
            type="button"
            className="z-50  group flex-shrink-0 size-6 grid place-items-center rounded-sm border border-subtle transition-all md:hidden"
            onClick={() => toggleSidebar()}
          >
            <Menu className="size-3.5 text-secondary transition-all group-hover:text-primary" />
          </button>
        </div>
        {/* path */}
        <div className="flex items-center gap-2">
          <ChevronRightIcon className="size-4 text-tertiary" />
          <span className="text-13 font-medium text-secondary">{t(activePath)}</span>
        </div>
      </div>
    </div>
  );
});
