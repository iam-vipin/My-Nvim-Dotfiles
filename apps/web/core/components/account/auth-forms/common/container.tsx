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

export function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center flex-grow w-full py-6 mt-10">
      <div className="relative flex flex-col gap-6 max-w-[22.5rem] w-full">{children}</div>
    </div>
  );
}
