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

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_AVATAR_IMAGE_MIME_TYPES_FOR_REACT_DROPZONE = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
  "image/webp": [],
};
export const ACCEPTED_COVER_IMAGE_MIME_TYPES_FOR_REACT_DROPZONE = {
  "image/jpeg": [],
  "image/jpg": [],
  "image/png": [],
  "image/webp": [],
};

/**
 * Dangerous file extensions that should be blocked
 */
export const DANGEROUS_EXTENSIONS = [
  "exe",
  "bat",
  "cmd",
  "sh",
  "php",
  "asp",
  "aspx",
  "jsp",
  "cgi",
  "dll",
  "vbs",
  "jar",
  "ps1",
];
