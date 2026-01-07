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

import type { HTMLElement } from "node-html-parser";
/*
A parser extension has two functions:
  1. shouldParse(root: HTMLElement) -> boolean // Predicate to check whether the extension should parse the html or not
  2. mutate(root: HTMLElement) -> root // Mutate the root node as needed
*/
export interface IParserExtension {
  shouldParse(node: HTMLElement): boolean;
  mutate(node: HTMLElement): Promise<HTMLElement>;
}
