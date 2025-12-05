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
