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

import type { Editor } from "@tiptap/core";
import { Sigma } from "lucide-react";
import React from "react";
// types
import type { TMathComponentProps } from "../../types";
// local components
import { BlockMathContainer } from "./container";

type TBlockMathEmptyProps = TMathComponentProps & {
  selected?: boolean;
  editor?: Editor;
  isEditable?: boolean;
};

export function BlockMathEmptyState({ onClick, selected, editor, isEditable }: TBlockMathEmptyProps) {
  return (
    <BlockMathContainer onClick={onClick} selected={selected} editor={editor} variant="empty" isEditable={isEditable}>
      <Sigma className="size-4 shrink-0" />
      <div className="text-base font-medium">Click to add equation</div>
    </BlockMathContainer>
  );
}
