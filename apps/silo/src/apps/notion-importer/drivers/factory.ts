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

import type { ZipManager } from "@/lib/zip-manager";
import { ConfluenceImportDriver } from "./confluence/driver";
import { NotionImportDriver } from "./notion/driver";
import type { IZipImportDriver } from "./types";

export enum EZipDriverType {
  NOTION = "NOTION",
  CONFLUENCE = "CONFLUENCE",
}

/**
 * Factory class for creating the tree builder based on the type
 */
export class ZipDriverFactory {
  static getDriver(type: EZipDriverType, zipManager: ZipManager): IZipImportDriver {
    switch (type) {
      case EZipDriverType.NOTION:
        return new NotionImportDriver(zipManager);
      case EZipDriverType.CONFLUENCE:
        return new ConfluenceImportDriver(zipManager);
      default:
        throw new Error("Invalid tree builder type");
    }
  }
}
