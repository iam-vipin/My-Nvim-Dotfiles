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

import type { Node } from "@tiptap/core";
// local imports
import type { MathematicsExtensionOptions, TMathBaseCommandOptions } from "../types";

// INLINE COMMAND OPTION TYPES
export type TInlineMathSetCommandOptions = TMathBaseCommandOptions;

export type TInlineMathUnsetCommandOptions = {
  pos?: number;
};

export type TInlineMathUpdateCommandOptions = {
  latex?: string;
  pos?: number;
  removeIfEmpty?: boolean;
};

// INLINE EXTENSION TYPE
export type InlineMathOptions = Pick<MathematicsExtensionOptions, "isFlagged" | "onClick">;

export type InlineMathExtensionType = Node<InlineMathOptions>;
