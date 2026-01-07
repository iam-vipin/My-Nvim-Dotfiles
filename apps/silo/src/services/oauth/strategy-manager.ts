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

import type { E_INTEGRATION_KEYS } from "@plane/types";
import type { OAuthStrategy } from "./types";

export class OAuthStrategyManager {
  private static instance: OAuthStrategyManager;
  private strategies: Map<E_INTEGRATION_KEYS, OAuthStrategy>;

  private constructor() {
    this.strategies = new Map();
  }

  public static getInstance(): OAuthStrategyManager {
    if (!OAuthStrategyManager.instance) {
      console.log("Creating new instance of OAuthStrategyManager");
      OAuthStrategyManager.instance = new OAuthStrategyManager();
    }
    return OAuthStrategyManager.instance;
  }

  public registerStrategy(type: E_INTEGRATION_KEYS, strategy: OAuthStrategy): void {
    this.strategies.set(type, strategy);
  }

  public getStrategy(type: E_INTEGRATION_KEYS): OAuthStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`No OAuth strategy found for type: ${type}`);
    }
    return strategy;
  }

  public hasStrategy(type: E_INTEGRATION_KEYS): boolean {
    return this.strategies.has(type);
  }

  public getStrategies(): Map<E_INTEGRATION_KEYS, OAuthStrategy> {
    return this.strategies;
  }
}
