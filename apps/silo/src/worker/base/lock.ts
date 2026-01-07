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

import type { Store } from ".";

export type LockConfig = (
  | {
      type: "default";
      workspaceId: undefined | string;
      jobId: undefined | string;
    }
  | {
      type: "custom";
      lockKey: string;
    }
) & {
  ttl?: number;
};

export class Lock {
  private readonly lockKey: string;
  private readonly lockTTL: number;

  constructor(
    private store: Store,
    config: LockConfig
  ) {
    if (config.type === "default") {
      this.lockKey = `silo:${config.workspaceId}:${config.jobId}:lock`;
    } else {
      this.lockKey = config.lockKey;
    }
    this.lockTTL = config.ttl ?? 6 * 60 * 60; // 6 hours
  }

  async acquireLock(batchId: string): Promise<boolean> {
    // Try to acquire lock using SETNX
    return await this.store.set(this.lockKey, batchId, this.lockTTL);
  }

  async releaseLock(): Promise<void> {
    await this.store.del(this.lockKey);
  }

  async getCurrentBatch(): Promise<string | null> {
    return await this.store.get(this.lockKey);
  }
}
