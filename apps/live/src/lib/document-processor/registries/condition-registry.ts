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

import type { ActionCondition } from "@/types/document-action";

/**
 * Registry of conditions that can be used to determine if an action should be applied
 */
export class ConditionRegistry {
  private static conditions: Map<string, ActionCondition> = new Map();

  /**
   * Register a new condition
   */
  static register(condition: ActionCondition): void {
    this.conditions.set(condition.name, condition);
  }

  /**
   * Get a condition by name
   */
  static get(name: string): ActionCondition | undefined {
    return this.conditions.get(name);
  }

  /**
   * Get all registered conditions
   */
  static getAll(): ActionCondition[] {
    return Array.from(this.conditions.values());
  }
}
