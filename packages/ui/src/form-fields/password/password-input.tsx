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

import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { Tooltip } from "@plane/propel/tooltip";
import { cn } from "@plane/utils";

type TPasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showToggle?: boolean;
  error?: boolean;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
};

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "Enter your password",
  className,
  showToggle = true,
  error = false,
  autoComplete = "off",
}: TPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2 pr-10 text-secondary border rounded-md bg-surface-1 focus:outline-none focus:ring-2 focus:ring-accent-strong placeholder:text-placeholder focus:border-transparent transition-all duration-200",
          {
            "border-strong": !error,
            "border-danger-strong": error,
          },
          className
        )}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {showToggle && (
        <Tooltip tooltipContent={showPassword ? "Hide password" : "Show password"} position="top">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors duration-200"
          >
            <div className="relative w-4 h-4">
              <Eye
                className={cn(
                  "absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out",
                  showPassword ? "opacity-0 scale-75 rotate-12" : "opacity-100 scale-100 rotate-0"
                )}
              />
              <EyeClosed
                className={cn(
                  "absolute inset-0 h-4 w-4 transition-all duration-300 ease-in-out",
                  showPassword ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-12"
                )}
              />
            </div>
          </button>
        </Tooltip>
      )}
    </div>
  );
}
