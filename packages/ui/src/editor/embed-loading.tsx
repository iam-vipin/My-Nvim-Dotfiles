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

import React from "react";
import { Loader } from "..";

type EmbedLoadingProps = {
  showLoading?: boolean;
};

export function EmbedLoading({ showLoading = true }: EmbedLoadingProps) {
  if (!showLoading) return null;

  return (
    <div className="flex justify-center items-center w-full h-full my-2">
      <Loader className="w-full h-full">
        <Loader.Item width="100%" height="100%" className="min-h-[36px]" />
      </Loader>
    </div>
  );
}
