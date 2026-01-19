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

import type { S3Client } from "@aws-sdk/client-s3";

export type TZipFileNode = {
  id: string;
  name: string;
  type: EZipNodeType;
  path: string;
  depth: number;
  children?: TZipFileNode[];
};

export type TZipManagerOptions = {
  type: "local" | "s3";
  path?: string;
  bucket?: string;
  s3Client?: S3Client;
};

export enum EZipNodeType {
  FILE = "file",
  DIRECTORY = "directory",
}
