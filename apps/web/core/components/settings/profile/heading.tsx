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

import { Button } from "@plane/propel/button";
import { cn } from "@plane/ui";

type Props = {
  title: string | React.ReactNode;
  description?: string;
  appendToRight?: React.ReactNode;
  showButton?: boolean;
  customButton?: React.ReactNode;
  button?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

export function ProfileSettingsHeading({
  title,
  description,
  button,
  appendToRight,
  customButton,
  showButton = true,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-4 items-start md:items-center justify-between", className)}>
      <div className="flex flex-col items-start gap-1">
        {typeof title === "string" ? <h6 className="text-h6-medium text-primary">{title}</h6> : title}
        {description && <p className="text-body-xs-regular text-tertiary">{description}</p>}
      </div>
      {showButton && customButton}
      {button && showButton && (
        <Button variant="primary" size="lg" onClick={button.onClick} className="w-fit">
          {button.label}
        </Button>
      )}
      {appendToRight}
    </div>
  );
}
