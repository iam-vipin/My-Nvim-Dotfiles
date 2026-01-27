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

import { SquareRadical } from "lucide-react";
import React from "react";
// types
import type { TMathComponentProps } from "../../types";
// local components
import { InlineMathContainer } from "./container";

type TInlineMathEmptyProps = TMathComponentProps;

export function InlineMathEmptyState({ onClick, isEditable }: TInlineMathEmptyProps) {
  return (
    <InlineMathContainer onClick={onClick} variant="empty" title="Click to add equation" isEditable={isEditable}>
      <SquareRadical className="size-4 shrink-0" />
      <span>New equation</span>
    </InlineMathContainer>
  );
}
