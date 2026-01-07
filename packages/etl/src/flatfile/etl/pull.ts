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

import type { RecordWithLinks } from "@flatfile/api/api";
import type { FlatfileService } from "../services/api.service";
import type { TExtractedRecord } from "../types";
import { extractRecord } from "./transform";

/**
 * @function pullSheetRecords
 * @description Pulls and processes all records from a specified Flatfile workbook
 * @param {FlatfileService} service - The Flatfile service instance to use for API calls
 * @param {string} workbookId - ID of the workbook to pull records from
 * @returns {Promise<TExtractedRecord>} Array of extracted and transformed records
 * @throws {Error} If records cannot be pulled or processed
 */
export const pullSheetRecords = async (service: FlatfileService, workbookId: string): Promise<TExtractedRecord[]> => {
  const recordMap = await service.getWorkbookRecords(workbookId);
  const records: RecordWithLinks[] = [];

  Object.values(recordMap).map((record) => records.push(...record));

  const extractedRecords = records.map((record) => extractRecord(record));
  return extractedRecords;
};
