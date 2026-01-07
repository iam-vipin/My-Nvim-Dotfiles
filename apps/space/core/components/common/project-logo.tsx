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

// types
import type { TLogoProps } from "@plane/types";
// helpers
import { cn } from "@plane/utils";

type Props = {
  className?: string;
  logo: TLogoProps;
};

export function ProjectLogo(props: Props) {
  const { className, logo } = props;

  if (logo.in_use === "icon" && logo.icon)
    return (
      <span
        style={{
          color: logo.icon.color,
        }}
        className={cn("material-symbols-rounded text-14", className)}
      >
        {logo.icon.name}
      </span>
    );

  if (logo.in_use === "emoji" && logo.emoji)
    return (
      <span className={cn("text-14", className)}>
        {logo.emoji.value?.split("-").map((emoji) => String.fromCodePoint(parseInt(emoji, 10)))}
      </span>
    );

  return <span />;
}
