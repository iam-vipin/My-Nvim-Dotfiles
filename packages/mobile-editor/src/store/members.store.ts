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

import { action, observable, makeObservable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
import type { TMentionSuggestionResponse } from "@/types";

export interface IMembersStore {
  // observable
  members: TMentionSuggestionResponse[];
  // computed
  getMemberById: (id: string) => TMentionSuggestionResponse | undefined;
  filterMembersByQuery: (query: string) => TMentionSuggestionResponse[];
  isMembersFetched: boolean;
  // action
  setMembers: (members: TMentionSuggestionResponse[]) => void;
}

export class MembersStore implements IMembersStore {
  members: TMentionSuggestionResponse[] = [];

  constructor() {
    makeObservable(this, {
      // observable
      members: observable.ref,
      // action
      setMembers: action,
    });
  }

  get isMembersFetched() {
    return this.members.length > 0;
  }

  /**
   * Returns a member by ID
   */
  getMemberById = computedFn((id: string) => this.members.find((member) => member.id === id));

  /**
   * @description: Filters members by first name, last name, or display name
   * @param {string} query
   * @returns {TMentionSuggestionResponse[]}
   */
  filterMembersByQuery = computedFn((query: string) =>
    this.members.filter(
      (member) =>
        member.displayName?.toLowerCase().includes(query.toLowerCase()) ||
        member.firstName?.toLowerCase().includes(query.toLowerCase()) ||
        member.lastName?.toLowerCase().includes(query.toLowerCase())
    )
  );

  /**
   * @description: Sets the members list
   * @param {TMentionSuggestionResponse[]} members
   */
  setMembers = (members: TMentionSuggestionResponse[]) => {
    if (!members || members.length === 0) return;
    runInAction(() => (this.members = members));
  };
}
