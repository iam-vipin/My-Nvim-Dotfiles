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
// types
import type { TMathComponentProps } from "../../types";
// local components
import { BlockMathContainer } from "./container";

type TBlockMathErrorProps = TMathComponentProps & {
  errorMessage: string;
  isEditable?: boolean;
};

export function BlockMathErrorState({ errorMessage, onClick, isEditable }: TBlockMathErrorProps) {
  const latexMessage = errorMessage.replace("KaTeX", "LaTeX");

  return (
    <BlockMathContainer onClick={onClick} variant="error" isEditable={isEditable}>
      <div className="block-equation-inner text-danger-primary text-13">{latexMessage}</div>
    </BlockMathContainer>
  );
}
