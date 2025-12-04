import type { TLogoProps } from "../common";
import type { TProjectDetails } from "../publish";
import type { TIssueProperty, TIssuePropertyOption, EIssuePropertyType } from "../work-item-types";
import type { TIssuePropertySerializedEntry } from "../work-item-types/work-item-types-extended";

export type TIntakeTypeForm = {
  id: string;
  name: string;
  work_item_type: string;
  form_fields: string[];
  is_active?: boolean;
  description?: string;
  anchor?: string;
};

export type TIntakeFormSettingsResponse = Omit<TIntakeTypeForm, "form_fields"> & {
  intake: string;
  created_at: string;
  updated_at: string;
  form_fields: Array<TIssueProperty<EIssuePropertyType> & { options: TIssuePropertyOption[] }>;
  project_details?: TProjectDetails;
  workspace: string;
};

export type TIntakeFormSubmitPayload = {
  username: string;
  email: string;
  name: string;
  description_html: string;
  values: Record<string, string | string[] | boolean>;
  attachment_ids: string[];
};

export type TIntakeFormProperty = {
  property: TIssueProperty<EIssuePropertyType>;
  options?: TIssuePropertyOption[];
};

export type TIntakePublishFormProps = {
  // Preview mode flag
  isPreview?: boolean;

  // Project metadata
  projectName: string;
  projectLogo?: TLogoProps;
  projectCoverImage?: string;
  projectCoverImageFallback: string;

  // Form configuration
  formTitle: string;
  properties: TIntakeFormProperty[];

  // Form handlers
  isSubmitting?: boolean;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;

  // Optional rich editor
  editorComponent?: React.ComponentType<any>;
  editorProps?: Record<string, any>;

  // File upload handler
  onFileUpload?: (files: File[]) => Promise<string[]> | void;

  className?: string;
};

export type TIntakeIssueExtended = {
  additional_information: TIssuePropertySerializedEntry[];
};
