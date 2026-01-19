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

import type { DocumentAction } from "@/types/document-action";

/**
 * Registry of actions that can be performed on the document
 */
export class ActionRegistry {
  private static actions: Map<string, DocumentAction> = new Map();

  /**
   * Register a new action
   */
  static register(action: DocumentAction): void {
    this.actions.set(action.name, action);
  }

  /**
   * Get an action by name
   */
  static get(name: string): DocumentAction | undefined {
    return this.actions.get(name);
  }

  /**
   * Get all registered actions
   */
  static getAll(): DocumentAction[] {
    return Array.from(this.actions.values());
  }
}
