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
import { Row, ERowVariant } from "@plane/ui";

interface IListContainer {
  children: React.ReactNode;
}

export function ListLayout(props: IListContainer) {
  const { children } = props;
  return (
    <Row
      variant={ERowVariant.HUGGING}
      className="flex h-full w-full flex-col overflow-y-auto vertical-scrollbar scrollbar-lg"
    >
      {children}
    </Row>
  );
}
