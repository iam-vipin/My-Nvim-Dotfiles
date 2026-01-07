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

import { AlertCircle, CheckCircle2 } from "lucide-react";

type TBanner = {
  type: "success" | "error";
  message: string;
};

export function Banner(props: TBanner) {
  const { type, message } = props;

  return (
    <div
      className={`rounded-md p-2 w-full border ${type === "error" ? "bg-danger-subtle border-danger-strong" : "bg-success-subtle border-success-strong"}`}
    >
      <div className="flex items-center justify-center">
        <div className="flex-shrink-0">
          {type === "error" ? (
            <span className="flex items-center justify-center h-6 w-6 rounded-full">
              <AlertCircle className="h-5 w-5 text-danger-primary" aria-hidden="true" />
            </span>
          ) : (
            <CheckCircle2 className="h-5 w-5 text-success-primary" aria-hidden="true" />
          )}
        </div>
        <div className="ml-1">
          <p className={`text-13 font-medium ${type === "error" ? "text-danger-primary" : "text-success-primary"}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
