import { action, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
// plane imports
import type { TIntakeUser } from "@plane/types";
// services
import { IntakeResponsibilityService } from "@/plane-web/services/intake-responsibility.service";
// store
import type { RootStore } from "@/plane-web/store/root.store";

export interface IIntakeResponsibilityStore {
  assigneesMap: Map<string, TIntakeUser>;
  fetchIntakeAssignee: (workspaceSlug: string, projectId: string) => Promise<void>;
  createIntakeAssignee: (workspaceSlug: string, projectId: string, data: { user: string }) => Promise<void>;
  deleteIntakeAssignee: (workspaceSlug: string, projectId: string, userId: string) => Promise<void>;
  // computed
  getAssignee: (projectId: string) => string | null;
}

export class IntakeResponsibilityStore implements IIntakeResponsibilityStore {
  // observables
  assigneesMap: Map<string, TIntakeUser> = new Map();

  // services
  intakeResponsibilityService = new IntakeResponsibilityService();

  // store
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeObservable(this, {
      // observable
      assigneesMap: observable,
      // actions
      fetchIntakeAssignee: action,
      createIntakeAssignee: action,
      deleteIntakeAssignee: action,
    });
    this.rootStore = rootStore;
  }

  // actions
  fetchIntakeAssignee = async (workspaceSlug: string, projectId: string) => {
    try {
      const assignee = await this.intakeResponsibilityService.getIntakeAssignee(workspaceSlug, projectId);
      runInAction(() => {
        this.assigneesMap.set(projectId, assignee);
      });
    } catch (error) {
      console.error("Error fetching intake assignee", error);
      throw error;
    }
  };

  createIntakeAssignee = async (workspaceSlug: string, projectId: string, data: { user: string }) => {
    try {
      const assignee = await this.intakeResponsibilityService.createIntakeAssignee(workspaceSlug, projectId, data);
      runInAction(() => {
        this.assigneesMap.set(projectId, assignee);
      });
    } catch (error) {
      console.error("Error creating intake assignee", error);
      throw error;
    }
  };

  deleteIntakeAssignee = async (workspaceSlug: string, projectId: string, userId: string) => {
    try {
      await this.intakeResponsibilityService.deleteIntakeAssignee(workspaceSlug, projectId, userId);
      runInAction(() => {
        this.assigneesMap.delete(projectId);
      });
    } catch (error) {
      console.error("Error deleting intake assignee", error);
      throw error;
    }
  };

  // computed
  getAssignee = computedFn((projectId: string) => {
    const assignee = this.assigneesMap.get(projectId);
    return assignee?.user || null;
  });
}
