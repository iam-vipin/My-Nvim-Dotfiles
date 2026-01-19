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

import { Switch } from "@headlessui/react";
// helpers
import { cn } from "../utils";

interface IToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

function ToggleSwitch(props: IToggleSwitchProps) {
  const { value, onChange, label, size = "sm", disabled, className } = props;

  return (
    <Switch
      checked={value}
      disabled={disabled}
      onChange={onChange}
      className={cn(
        "relative inline-flex flex-shrink-0 h-6 w-10 cursor-pointer rounded-full border border-subtle transition-colors duration-200 ease-in-out focus:outline-none bg-layer-1",
        {
          "h-4 w-7": size === "sm",
          "h-5 w-9": size === "md",
          "bg-accent-primary": value && !disabled,
          "bg-(--text-color-icon-placeholder)": !value && !disabled,
          "cursor-not-allowed opacity-50 bg-accent-primary": value && disabled,
          "cursor-not-allowed opacity-50 bg-(--text-color-icon-placeholder)": !value && disabled,
        },
        className
      )}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "inline-block self-center h-5 w-5 transform rounded-full bg-(--text-color-icon-on-color) ring-0 transition duration-200 ease-in-out",
          {
            "h-3 w-3 translate-x-3.5": size === "sm" && value,
            "h-3 w-3 translate-x-0.5": size === "sm" && !value,
            "h-4 w-4 translate-x-4": size === "md" && value,
            "h-4 w-4 translate-x-0.5": size === "md" && !value,
            "translate-x-4": size === "lg" && value,
            "translate-x-0.5": size === "lg" && !value,
          }
        )}
      />
    </Switch>
  );
}

ToggleSwitch.displayName = "plane-ui-toggle-switch";

export { ToggleSwitch };
