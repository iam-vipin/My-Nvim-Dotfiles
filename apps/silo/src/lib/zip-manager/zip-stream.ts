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

import type { StorageProvider } from "./storage-provider";

export class ZipStream {
  private storageProvider: StorageProvider;
  private fileId: string;
  private position = 0;
  private contentLength: number;

  constructor(storageProvider: StorageProvider, fileId: string, contentLength: number) {
    this.storageProvider = storageProvider;
    this.fileId = fileId;
    this.contentLength = contentLength;
  }

  async seek(offset: number, whence: number = 0): Promise<number> {
    if (whence === 0) {
      // SEEK_SET
      this.position = offset;
    } else if (whence === 1) {
      // SEEK_CUR
      this.position += offset;
    } else if (whence === 2) {
      // SEEK_END
      this.position = this.contentLength + offset;
    } else {
      throw new Error(`Invalid whence value: ${whence}`);
    }

    this.position = Math.max(0, Math.min(this.position, this.contentLength));
    return this.position;
  }

  async read(size: number = -1): Promise<Buffer> {
    if (size === -1) {
      // Read to the end
      const buffer = await this.storageProvider.readRange(this.fileId, this.position);
      await this.seek(0, 2); // Seek to end
      return buffer;
    } else {
      const endPosition = Math.min(this.position + size - 1, this.contentLength - 1);
      const buffer = await this.storageProvider.readRange(this.fileId, this.position, endPosition);
      await this.seek(buffer.length, 1); // Seek forward by actual bytes read
      return buffer;
    }
  }

  get size(): number {
    return this.contentLength;
  }

  tell(): number {
    return this.position;
  }

  seekable(): boolean {
    return true;
  }

  readable(): boolean {
    return true;
  }
}
