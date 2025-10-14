// plane imports
import { EUserPermissions } from "@plane/constants";
import type { TPageTemplate } from "@plane/types";
// local imports
import type { IBaseTemplateInstance, TBaseTemplateInstanceProps } from "./base";
import { BaseTemplateInstance } from "./base";

export type TPageTemplateInstanceProps = TBaseTemplateInstanceProps<TPageTemplate>;

// export interface IPageTemplateInstance extends IBaseTemplate<TPageTemplate> { }
export type IPageTemplateInstance = IBaseTemplateInstance<TPageTemplate>;

export class PageTemplateInstance extends BaseTemplateInstance<TPageTemplate> implements IPageTemplateInstance {
  constructor(protected store: TPageTemplateInstanceProps) {
    super(store);
  }

  // computed
  get canCurrentUserEditTemplate() {
    return this.getUserRoleForTemplateInstance === EUserPermissions.ADMIN;
  }

  get canCurrentUserDeleteTemplate() {
    return this.getUserRoleForTemplateInstance === EUserPermissions.ADMIN;
  }

  get canCurrentUserPublishTemplate() {
    return false;
  }

  get canCurrentUserUnpublishTemplate() {
    return this.canCurrentUserPublishTemplate && this.is_published;
  }
}
