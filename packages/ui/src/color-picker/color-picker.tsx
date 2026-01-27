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

import * as React from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker(props: ColorPickerProps) {
  const { value, onChange, className = "" } = props;
  // refs
  const inputRef = React.useRef<HTMLInputElement>(null);

  // handlers
  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    inputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center relative">
      <button
        className={`size-4 rounded-full cursor-pointer conical-gradient ${className}`}
        onClick={handleOnClick}
        aria-label="Open color picker"
      />
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 size-4 invisible"
        aria-hidden="true"
      />
    </div>
  );
}
