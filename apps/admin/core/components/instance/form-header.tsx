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

export function FormHeader({ heading, subHeading }: { heading: string; subHeading: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-20 font-semibold text-primary leading-7">{heading}</span>
      <span className="text-16 font-semibold text-placeholder leading-7">{subHeading}</span>
    </div>
  );
}
