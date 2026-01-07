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

type Props = {
  title: string;
  description: string;
};

export function CommonOnboardingHeader({ title, description }: Props) {
  return (
    <div className="text-left space-y-2">
      <h1 className="text-h4-semibold text-primary">{title}</h1>
      <p className="text-body-md-regular text-tertiary">{description}</p>
    </div>
  );
}
