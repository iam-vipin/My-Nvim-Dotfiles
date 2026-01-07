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

import { FlatfileClient } from "@flatfile/api";
import type { RecordWithLinks } from "@flatfile/api/api";
import type { FlatfileServiceConfig } from "../types";

/**
 * @class FlatfileService
 * @description Service class for interacting with the Flatfile API
 */
export class FlatfileService {
  private client: FlatfileClient;

  /**
   * @constructor
   * @param {FlatfileServiceConfig} config - Configuration for the Flatfile service
   */
  constructor(config: FlatfileServiceConfig) {
    this.client = new FlatfileClient({
      token: config.apiKey,
    });
  }

  /**
   * @method listSheets
   * @description Lists all sheets in a workbook
   * @param {string} workbookId - The ID of the workbook
   */
  async listSheets(workbookId: string) {
    return await this.client.sheets.list({ workbookId });
  }

  /**
   * @method listSheetRecords
   * @description Lists all records in a sheet
   * @param {string} sheetId - The ID of the sheet
   */
  async listSheetRecords(sheetId: string) {
    return await this.client.records.get(sheetId);
  }

  /**
   * @method getWorkbookRecords
   * @description Gets all records from all sheets in a workbook
   * @param {string} workbookId - The ID of the workbook
   */
  async getWorkbookRecords(workbookId: string) {
    const sheets = await this.listSheets(workbookId);
    const records: Record<string, RecordWithLinks[]> = {};

    for (const sheet of sheets.data) {
      const sheetRecords = await this.listSheetRecords(sheet.id);
      records[sheet.name] = sheetRecords.data.records;
    }

    return records;
  }
}
