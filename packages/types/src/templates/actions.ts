// plane imports
import type { TBaseTemplateWithData } from "../templates/base";
import type { PartialDeep } from "../utils";

export interface IBaseTemplateActionCallbacks<T extends TBaseTemplateWithData> {
  create: (template: PartialDeep<T>) => Promise<T>;
  update: (templateId: string, data: PartialDeep<T>) => Promise<T>;
  destroy: (template: T) => Promise<void>;
}
