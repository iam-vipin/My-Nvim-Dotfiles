// plane imports
import type { EditorTitleRefApi } from "@plane/editor";
// store
import type { TPageInstance } from "@/store/pages/base-page";

export type TPageTemplatePickerProps = {
  isPageLoading: boolean;
  page: TPageInstance;
  projectId: string | undefined;
  titleEditorRef: React.RefObject<EditorTitleRefApi>;
  workspaceSlug: string;
};

export function PageTemplatePicker(_props: TPageTemplatePickerProps) {
  return null;
}
