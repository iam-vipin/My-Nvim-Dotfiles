// stores
import { makeObservable } from "mobx";
// plane web store
import type {
  IIntegrationBaseStore,
  IGitlabAuthStore,
  IGitlabDataStore,
  IGitlabEntityConnectionStore,
} from "@/plane-web/store/integrations";
import {
  IntegrationBaseStore,
  GitlabAuthStore,
  GitlabDataStore,
  GitlabEntityStore,
} from "@/plane-web/store/integrations";
import type { RootStore } from "@/plane-web/store/root.store";

export interface IGitlabStore extends IIntegrationBaseStore {
  // store instances
  auth: IGitlabAuthStore;
  data: IGitlabDataStore;
  entityConnection: IGitlabEntityConnectionStore;
}

export class GitlabStore extends IntegrationBaseStore implements IGitlabStore {
  // store instances
  auth: IGitlabAuthStore;
  data: IGitlabDataStore;
  entityConnection: IGitlabEntityConnectionStore;

  constructor(protected store: RootStore) {
    super(store);
    makeObservable(this, {});

    // store instances
    this.auth = new GitlabAuthStore(this);
    this.data = new GitlabDataStore(this);
    this.entityConnection = new GitlabEntityStore(this);
  }
}
