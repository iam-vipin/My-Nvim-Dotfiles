// root store
import type { RootStore } from "@/plane-web/store/root.store";
// templates stores
import type { ITemplateHelperStore } from "./helper.store";
import { TemplateHelperStore } from "./helper.store";
import type { IPageTemplateStore } from "./page.store";
import { PageTemplateStore } from "./page.store";
import type { IProjectTemplateStore } from "./project.store";
import { ProjectTemplateStore } from "./project.store";
import type { IWorkItemTemplateStore } from "./work-item.store";
import { WorkItemTemplateStore } from "./work-item.store";

export interface ITemplatesRootStore {
  projectTemplates: IProjectTemplateStore;
  workItemTemplates: IWorkItemTemplateStore;
  pageTemplates: IPageTemplateStore;
  templateHelper: ITemplateHelperStore;
}

export class TemplatesRootStore implements ITemplatesRootStore {
  projectTemplates: IProjectTemplateStore;
  workItemTemplates: IWorkItemTemplateStore;
  pageTemplates: IPageTemplateStore;
  templateHelper: ITemplateHelperStore;

  constructor(root: RootStore) {
    this.projectTemplates = new ProjectTemplateStore(root);
    this.workItemTemplates = new WorkItemTemplateStore(root);
    this.pageTemplates = new PageTemplateStore(root);
    this.templateHelper = new TemplateHelperStore(root);
  }
}
