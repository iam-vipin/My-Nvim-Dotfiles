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

// types
import type { TButtonVariants } from "./types";

export const BORDER_BUTTON_VARIANTS: TButtonVariants[] = ["border-with-text", "border-without-text"];

export const BACKGROUND_BUTTON_VARIANTS: TButtonVariants[] = ["background-with-text", "background-without-text"];

export const TRANSPARENT_BUTTON_VARIANTS: TButtonVariants[] = ["transparent-with-text", "transparent-without-text"];

export const BUTTON_VARIANTS_WITHOUT_TEXT: TButtonVariants[] = [
  "border-without-text",
  "background-without-text",
  "transparent-without-text",
];

export const BUTTON_VARIANTS_WITH_TEXT: TButtonVariants[] = [
  "border-with-text",
  "background-with-text",
  "transparent-with-text",
];
