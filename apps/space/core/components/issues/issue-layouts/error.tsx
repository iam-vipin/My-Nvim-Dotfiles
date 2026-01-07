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

// assets
import SomethingWentWrongImage from "@/app/assets/something-went-wrong.svg?url";

export function SomethingWentWrongError() {
  return (
    <div className="bg-surface-1 grid min-h-screen w-full place-items-center p-6">
      <div className="text-center">
        <div className="mx-auto grid h-52 w-52 place-items-center rounded-full">
          <div className="grid h-32 w-32 place-items-center">
            <img
              src={SomethingWentWrongImage}
              alt="Oops! Something went wrong"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <h1 className="mt-12 text-24 font-semibold">Oops! Something went wrong.</h1>
        <p className="mt-4 text-tertiary">The public board does not exist. Please check the URL.</p>
      </div>
    </div>
  );
}
