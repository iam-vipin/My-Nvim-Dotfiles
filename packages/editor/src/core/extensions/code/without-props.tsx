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

import ts from "highlight.js/lib/languages/typescript";
import { common, createLowlight } from "lowlight";
// components
import { CodeBlockLowlight } from "./code-block-lowlight";

const lowlight = createLowlight(common);
lowlight.register("ts", ts);

export const CustomCodeBlockExtensionWithoutProps = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: "plaintext",
  exitOnTripleEnter: false,
});
