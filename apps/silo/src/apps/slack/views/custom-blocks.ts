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

import type {
  InputBlock,
  StaticSelect,
  PlainTextInput,
  MultiExternalSelect,
  Checkboxes,
  ExternalSelect,
  RichTextInput,
} from "@slack/types";

export interface StaticSelectInputBlock extends InputBlock {
  element: StaticSelect;
}

export interface PlainTextInputBlock extends InputBlock {
  element: PlainTextInput;
}

export interface MultiExternalSelectInputBlock extends InputBlock {
  element: MultiExternalSelect;
}

export interface CheckboxInputBlock extends InputBlock {
  element: Checkboxes;
}

export interface ExternalSelectInputBlock extends InputBlock {
  element: ExternalSelect;
}

export interface RichTextInputBlock extends InputBlock {
  element: RichTextInput;
}
