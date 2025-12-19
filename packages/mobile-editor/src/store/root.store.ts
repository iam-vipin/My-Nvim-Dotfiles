import { MembersStore } from "./members.store";
import { PageStore } from "./page.store";

export class RootStore {
  members: MembersStore;
  page: PageStore;

  constructor() {
    this.members = new MembersStore();
    this.page = new PageStore();
  }
}
