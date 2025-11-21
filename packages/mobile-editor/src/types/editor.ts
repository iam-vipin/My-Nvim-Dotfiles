export type TEditorParams = {
  autoFocus: boolean;
  currentUserId: string;
  content: string;
  placeholder: string;
  variant: TEditorVariant;
  editable: boolean;
};
export type TDocumentEditorParams = {
  editable: boolean;
  isSelfHosted: boolean;
  pageId: string;
  documentType: string;
  workspaceSlug: string;
  projectId?: string;
  parentPageId?: string;
  userId: string;
  userDisplayName: string;
  cookie: string;
  liveServerUrl: string;
  liveServerBasePath: string;
};
export enum TEditorVariant {
  sticky = "sticky",
  lite = "lite",
  rich = "rich",
  document = "document",
}
