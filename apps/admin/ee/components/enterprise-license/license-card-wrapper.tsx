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

import type { ReactNode } from "react";

type TLicenseCardWrapperProps = {
  children: ReactNode;
  description: ReactNode;
};

export function LicenseCardWrapper(props: TLicenseCardWrapperProps) {
  const { children, description } = props;

  return (
    <div className="rounded-lg border border-subtle bg-layer-1 p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-body-sm-semibold text-primary">Activate Enterprise license</h3>
          <div className="space-y-1 text-body-sm-regular text-secondary">{description}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
