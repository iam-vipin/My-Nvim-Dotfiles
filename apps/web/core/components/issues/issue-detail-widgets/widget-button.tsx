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

import type { FC } from "react";
import React from "react";
// helpers
import { Button } from "@plane/propel/button";

type Props = {
  icon: React.ReactNode;
  title: string;
  disabled?: boolean;
};

export function IssueDetailWidgetButton(props: Props) {
  const { icon, title, disabled = false } = props;
  return (
    <Button variant={"secondary"} disabled={disabled} size="lg">
      {icon && icon}
      <span className="text-body-xs-medium">{title}</span>
    </Button>
  );
}
