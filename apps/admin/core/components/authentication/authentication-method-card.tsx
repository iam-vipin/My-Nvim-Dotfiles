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

// helpers
import { cn } from "@plane/utils";

type Props = {
  name: string;
  description: string;
  icon: React.ReactNode;
  config: React.ReactNode;
  disabled?: boolean;
  withBorder?: boolean;
  unavailable?: boolean;
};

export function AuthenticationMethodCard(props: Props) {
  const { name, description, icon, config, disabled = false, withBorder = true, unavailable = false } = props;

  return (
    <div
      className={cn("w-full flex items-center gap-14 rounded-lg bg-layer-2", {
        "px-4 py-3 border border-subtle": withBorder,
      })}
    >
      <div
        className={cn("flex grow items-center gap-4", {
          "opacity-50": unavailable,
        })}
      >
        <div className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-layer-1">{icon}</div>
        </div>
        <div className="grow">
          <div
            className={cn("font-medium leading-5 text-primary", {
              "text-13": withBorder,
              "text-18": !withBorder,
            })}
          >
            {name}
          </div>
          <div
            className={cn("font-regular leading-5 text-tertiary", {
              "text-11": withBorder,
              "text-13": !withBorder,
            })}
          >
            {description}
          </div>
        </div>
      </div>
      <div className={`shrink-0 ${disabled && "opacity-70"}`}>{config}</div>
    </div>
  );
}
