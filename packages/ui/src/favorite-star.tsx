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

import { Star } from "lucide-react";
import React from "react";
// helpers
import { cn } from "./utils";

type Props = {
  buttonClassName?: string;
  iconClassName?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  selected: boolean;
};

export function FavoriteStar(props: Props) {
  const { buttonClassName, iconClassName, onClick, selected } = props;

  return (
    <button type="button" className={cn("h-4 w-4 grid place-items-center", buttonClassName)} onClick={onClick}>
      <Star
        className={cn(
          "h-4 w-4 text-tertiary transition-all",
          {
            "fill-(--color-label-yellow-icon) stroke-(--color-label-yellow-icon)": selected,
          },
          iconClassName
        )}
      />
    </button>
  );
}
