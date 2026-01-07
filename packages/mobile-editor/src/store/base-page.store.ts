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

import { set } from "lodash";
import { action, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import { EPageAccess } from "@plane/constants";
import type { TLogoProps } from "@plane/types";
import type { TPage } from "@/types/page";

type operationConfig = {
  shouldSync?: boolean;
  recursive?: boolean;
};

export interface IBasePageStore {
  // observables
  access: EPageAccess | undefined;
  archivedAt: string | null | undefined;
  canView: boolean;
  canEdit: boolean;
  deletedAt: string | null | undefined;
  id: string | undefined;
  isDescriptionEmpty: boolean | undefined;
  isLocked: boolean;
  name: string | undefined;
  projects?: string[] | undefined;
  subPages: Partial<TPage[]>;
  workspace: string | undefined;
  logoProps: TLogoProps | undefined;
  ownedBy: string | undefined;
  // computed
  canCurrentUserAccessPage: () => boolean;
  // actions
  updateTitle: (title: string) => void;
  makePublic: (operationConfig?: operationConfig) => Promise<void>;
  makePrivate: (operationConfig?: operationConfig) => Promise<void>;
  lock: (operationConfig?: operationConfig) => Promise<void>;
  unlock: (operationConfig?: operationConfig) => Promise<void>;
  archive: (operationConfig?: operationConfig) => Promise<void>;
  restore: (operationConfig?: operationConfig) => Promise<void>;
  mutateProperties: (data: Partial<TPage>) => void;
  setCanView: (canView: boolean) => void;
  setCanEdit: (canEdit: boolean) => void;
}

export class BasePageStore implements IBasePageStore {
  // observables
  access: EPageAccess | undefined;
  archivedAt: string | null | undefined;
  canView: boolean = false;
  canEdit: boolean = false;
  deletedAt: string | null | undefined;
  id: string | undefined;
  isDescriptionEmpty: boolean | undefined;
  isLocked: boolean;
  name: string | undefined;
  projects?: string[] | undefined;
  subPages: Partial<TPage[]> = [];
  workspace: string | undefined;
  logoProps: TLogoProps | undefined;
  ownedBy: string | undefined;

  constructor(page: TPage) {
    this.access = page.access;
    this.archivedAt = page.archivedAt;
    this.canView = page.canView;
    this.canEdit = page.canEdit;
    this.deletedAt = page.deletedAt;
    this.id = page.id;
    this.isDescriptionEmpty = page.isDescriptionEmpty;
    this.isLocked = page.isLocked == true;
    this.name = page.name;
    this.projects = page.projects;
    this.workspace = page.workspace;
    this.logoProps = page.logoProps;
    this.ownedBy = page.ownedBy;

    makeObservable(this, {
      access: observable.ref,
      archivedAt: observable.ref,
      id: observable.ref,
      isDescriptionEmpty: observable.ref,
      isLocked: observable.ref,
      name: observable.ref,
      projects: observable.ref,
      subPages: observable.ref,
      workspace: observable.ref,
      logoProps: observable.ref,
      ownedBy: observable.ref,
      // actions
      updateTitle: action,
      makePublic: action,
      makePrivate: action,
      lock: action,
      unlock: action,
      archive: action,
      restore: action,
      mutateProperties: action,
      setCanView: action,
      setCanEdit: action,
    });
  }

  canCurrentUserAccessPage = computedFn(() => this.canView);

  setCanView = (canView: boolean) => {
    this.canView = canView;
  };

  setCanEdit = (canEdit: boolean) => {
    this.canEdit = canEdit;
  };

  /**
   * @description update the title of the page
   * @param title string
   */
  updateTitle = (title: string) => {
    runInAction(() => {
      this.name = title;
    });
  };

  /**
   * @description make the page public
   */
  makePublic = async () => {
    runInAction(() => {
      this.access = EPageAccess.PUBLIC;
    });
  };

  /**
   * @description make the page private
   */
  makePrivate = async () => {
    runInAction(() => {
      this.access = EPageAccess.PRIVATE;
    });
  };

  /**
   * @description lock the page
   */
  lock = async () => {
    runInAction(() => (this.isLocked = true));
  };

  /**
   * @description unlock the page
   */
  unlock = async () => {
    runInAction(() => (this.isLocked = false));
  };

  /**
   * @description archive the page
   */
  archive = async () => {
    if (!this.id) return undefined;

    try {
      runInAction(() => {
        this.archivedAt = new Date().toISOString();
      });
    } catch (error) {
      console.error(error);
      runInAction(() => {
        this.archivedAt = null;
      });
    }
  };

  /**
   * @description restore the page
   */
  restore = async () => {
    const archivedAtBeforeRestore = this.archivedAt;

    try {
      runInAction(() => {
        this.archivedAt = null;
      });
    } catch (error) {
      console.error(error);
      runInAction(() => {
        this.archivedAt = archivedAtBeforeRestore;
      });
      throw error;
    }
  };

  /**
   * @description mutate multiple properties at once
   * @param data Partial<TPage>
   */
  mutateProperties = (data: Partial<TPage>) => {
    runInAction(() => {
      Object.keys(data).forEach((key) => {
        const dataKey = key as keyof TPage;
        set(this, dataKey, data[dataKey]);
      });
    });
  };
}
