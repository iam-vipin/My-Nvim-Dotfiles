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

import Link from "next/link";
import { Tooltip } from "@plane/propel/tooltip";

type Props = {
  label?: string;
  href?: string;
  icon?: React.ReactNode | undefined;
};

export function BreadcrumbLink(props: Props) {
  const { href, label, icon } = props;
  return (
    <Tooltip tooltipContent={label} position="bottom">
      <li className="flex items-center space-x-2" tabIndex={-1}>
        <div className="flex flex-wrap items-center gap-2.5">
          {href ? (
            <Link className="flex items-center gap-1 text-13 font-medium text-tertiary hover:text-primary" href={href}>
              {icon && <div className="flex h-5 w-5 items-center justify-center overflow-hidden !text-16">{icon}</div>}
              <div className="relative line-clamp-1 block max-w-[150px] overflow-hidden truncate">{label}</div>
            </Link>
          ) : (
            <div className="flex cursor-default items-center gap-1 text-13 font-medium text-primary">
              {icon && <div className="flex h-5 w-5 items-center justify-center overflow-hidden">{icon}</div>}
              <div className="relative line-clamp-1 block max-w-[150px] overflow-hidden truncate">{label}</div>
            </div>
          )}
        </div>
      </li>
    </Tooltip>
  );
}
