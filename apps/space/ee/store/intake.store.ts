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

import { makeObservable, observable, runInAction } from "mobx";
// plane imports
import { SitesFileService, SitesIntakeService } from "@plane/services";
import { EFileAssetType } from "@plane/types";
import type {
  TFileSignedURLResponse,
  TIntakeFormSettingsResponse,
  TIntakeFormSubmitPayload,
  TIntakeIssueForm,
} from "@plane/types";
// types

import type { TPublicCycle } from "@/types/cycle";

export interface IIntakeStore {
  // observables
  cycles: TPublicCycle[] | undefined;
  // crud actions
  publishIntakeForm: (anchor: string, data: TIntakeIssueForm) => Promise<void>;
  fetchTypeFormSettings: (anchor: string) => Promise<void>;
  submitTypeForm: (anchor: string, data: TIntakeFormSubmitPayload) => Promise<void>;
  uploadWorkItemAttachment: (file: File, anchor: string, workItemId?: string) => Promise<TFileSignedURLResponse>;
  settings: TIntakeFormSettingsResponse | undefined;
}

export class IntakeStore implements IIntakeStore {
  cycles: TPublicCycle[] | undefined = undefined;
  intakeService: SitesIntakeService;
  settings: TIntakeFormSettingsResponse | undefined = undefined;

  // services
  fileService: SitesFileService;

  constructor() {
    makeObservable(this, {
      // observables
      cycles: observable,
      settings: observable,
    });
    this.intakeService = new SitesIntakeService();
    this.fileService = new SitesFileService();
  }

  publishIntakeForm = async (anchor: string, data: TIntakeIssueForm) => {
    try {
      await this.intakeService.publishForm(anchor, data);
    } catch (error) {
      console.error("Error publishing intake form", error);
      throw error;
    }
  };

  fetchTypeFormSettings = async (anchor: string) => {
    try {
      const response = await this.intakeService.fetchFormSettings(anchor);
      runInAction(() => {
        if (response.anchor) {
          this.settings = response;
        }
      });
    } catch (error) {
      console.error("Error fetching form settings", error);
      throw error;
    }
  };

  submitTypeForm = async (anchor: string, data: TIntakeFormSubmitPayload) => {
    try {
      await this.intakeService.submitTypeForm(anchor, data);
    } catch (error) {
      console.error("Error submitting type form", error);
      throw error;
    }
  };

  uploadWorkItemAttachment = async (file: File, anchor: string, workItemId?: string) => {
    try {
      const res = await this.fileService.uploadAsset(
        anchor,
        {
          entity_identifier: workItemId ?? "",
          entity_type: EFileAssetType.INTAKE_FORM_ATTACHMENT,
        },
        file
      );
      return res;
    } catch (error) {
      console.log("Error in uploading work item attachment:", error);
      throw new Error("Asset upload failed. Please try again later.");
    }
  };
}
