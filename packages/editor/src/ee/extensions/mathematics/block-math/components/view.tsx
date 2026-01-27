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
// hooks
import { useMathRenderer } from "../../hooks/use-math-renderer";
// types
import type { TMathComponentProps } from "../../types";
// local components
import { BlockMathContainer } from "./container";

type TBlockMathComponentProps = TMathComponentProps & {
  latex: string;
  isEditable?: boolean;
};

export function BlockMathView({ latex, onClick, isEditable }: TBlockMathComponentProps) {
  const { mathRef } = useMathRenderer<HTMLDivElement>(latex, { displayMode: true, throwOnError: false });

  return (
    <BlockMathContainer onClick={onClick} variant="content" isEditable={isEditable}>
      <div
        ref={mathRef}
        className="block-equation-inner max-h-full overflow-x-auto overflow-y-hidden text-center horizontal-scrollbar scrollbar-xs"
        role="math"
        aria-label={`Block math equation: ${latex}`}
      />
    </BlockMathContainer>
  );
}
