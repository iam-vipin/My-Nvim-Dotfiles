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
import { cn } from "./utils";

type Props = {
  isVisible: boolean;
  classNames?: string;
};

export function DropIndicator(props: Props) {
  const { isVisible, classNames = "" } = props;

  return (
    <div
      className={cn(
        `block relative h-[2px] w-full
    before:left-0 before:relative before:block before:top-[-2px] before:h-[6px] before:w-[6px] before:rounded-sm
    after:left-[calc(100%-6px)] after:relative after:block after:top-[-8px] after:h-[6px] after:w-[6px] after:rounded-sm`,
        {
          "bg-accent-primary before:bg-accent-primary after:bg-accent-primary": isVisible,
        },
        classNames
      )}
    />
  );
}
