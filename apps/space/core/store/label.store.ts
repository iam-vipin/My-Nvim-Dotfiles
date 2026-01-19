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

import { set } from "lodash-es";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
// plane imports
import { SitesLabelService } from "@plane/services";
import type { IIssueLabel } from "@plane/types";
// store
import type { CoreRootStore } from "./root.store";

export interface IIssueLabelStore {
  // observables
  labels: IIssueLabel[] | undefined;
  // computed actions
  getLabelById: (labelId: string | undefined) => IIssueLabel | undefined;
  getLabelsByIds: (labelIds: string[]) => IIssueLabel[];
  // fetch actions
  fetchLabels: (anchor: string) => Promise<IIssueLabel[]>;
}

export class LabelStore implements IIssueLabelStore {
  labelMap: Record<string, IIssueLabel> = {};
  labelService: SitesLabelService;
  rootStore: CoreRootStore;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      labelMap: observable,
      // computed
      labels: computed,
      // fetch action
      fetchLabels: action,
    });
    this.labelService = new SitesLabelService();
    this.rootStore = _rootStore;
  }

  get labels() {
    return Object.values(this.labelMap);
  }

  getLabelById = (labelId: string | undefined) => (labelId ? this.labelMap[labelId] : undefined);

  getLabelsByIds = (labelIds: string[]) => {
    const currLabels = [];
    for (const labelId of labelIds) {
      const label = this.getLabelById(labelId);
      if (label) {
        currLabels.push(label);
      }
    }

    return currLabels;
  };

  fetchLabels = async (anchor: string) => {
    const labelsResponse = await this.labelService.list(anchor);
    runInAction(() => {
      this.labelMap = {};
      for (const label of labelsResponse) {
        set(this.labelMap, [label.id], label);
      }
    });
    return labelsResponse;
  };
}
