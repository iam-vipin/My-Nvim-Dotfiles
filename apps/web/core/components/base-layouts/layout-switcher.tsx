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

import { useTranslation } from "@plane/i18n";
import { Tooltip } from "@plane/propel/tooltip";
import type { TBaseLayoutType } from "@plane/types";
import { cn } from "@plane/utils";
import { usePlatformOS } from "@/hooks/use-platform-os";
import { BASE_LAYOUTS } from "./constants";

type Props = {
  layouts?: TBaseLayoutType[];
  onChange: (layout: TBaseLayoutType) => void;
  selectedLayout: TBaseLayoutType;
};

export function LayoutSwitcher(props: Props) {
  const { layouts, onChange, selectedLayout } = props;
  const { isMobile } = usePlatformOS();
  const { t } = useTranslation();

  const handleOnChange = (layoutKey: TBaseLayoutType) => {
    if (selectedLayout !== layoutKey) {
      onChange(layoutKey);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-md bg-layer-3 p-1">
      {BASE_LAYOUTS.filter((l) => (layouts ? layouts.includes(l.key) : true)).map((layout) => {
        const Icon = layout.icon;
        return (
          <Tooltip key={layout.key} tooltipContent={t(layout.i18n_title)} isMobile={isMobile}>
            <button
              type="button"
              className={cn(
                "group grid h-5.5 w-7 place-items-center overflow-hidden rounded-sm transition-all hover:bg-layer-transparent-hover",
                {
                  "bg-layer-transparent-active hover:bg-layer-transparent-active": selectedLayout === layout.key,
                }
              )}
              onClick={() => handleOnChange(layout.key)}
            >
              <Icon
                width={14}
                height={14}
                strokeWidth={2}
                className={cn("size-3.5", {
                  "text-primary": selectedLayout === layout.key,
                  "text-secondary": selectedLayout !== layout.key,
                })}
              />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
