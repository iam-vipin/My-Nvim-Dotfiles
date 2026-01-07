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

import type { ActionRule } from "@/types/document-action";

/**
 * Registry of rules that determine which actions to apply based on conditions
 */
export class RuleRegistry {
  private static rules: ActionRule[] = [];

  /**
   * Register a new rule
   */
  static register(rule: ActionRule): void {
    this.rules.push(rule);
    // Sort rules by priority (higher priority first)
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get all registered rules
   */
  static getAll(): ActionRule[] {
    return this.rules;
  }
}
