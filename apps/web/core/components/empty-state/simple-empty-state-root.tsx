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
// utils
import { cn } from "@plane/utils";

type EmptyStateSize = "sm" | "lg";

type Props = {
  title: string;
  description?: string;
  assetPath?: string;
  size?: EmptyStateSize;
};

const sizeConfig = {
  sm: {
    container: "size-24",
    dimensions: 78,
  },
  lg: {
    container: "size-28",
    dimensions: 96,
  },
} as const;

const getTitleClassName = (hasDescription: boolean) =>
  cn("font-medium whitespace-pre-line", {
    "text-13 text-placeholder": !hasDescription,
    "text-16 text-tertiary": hasDescription,
  });

export const SimpleEmptyState = observer(function SimpleEmptyState(props: Props) {
  const { title, description, size = "sm", assetPath } = props;

  return (
    <div className="text-center flex flex-col gap-2.5 items-center">
      {assetPath && (
        <div className={sizeConfig[size].container}>
          <img src={assetPath} alt={title} className="h-full w-full object-contain" />
        </div>
      )}

      <h3 className={getTitleClassName(!!description)}>{title}</h3>

      {description && <p className="text-14 font-medium text-placeholder whitespace-pre-line">{description}</p>}
    </div>
  );
});
