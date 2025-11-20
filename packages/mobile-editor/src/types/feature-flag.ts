export enum E_FEATURE_FLAGS {
  COLLABORATION_CURSOR = "collaborationCursor",
  EDITOR_AI_OPS = "editorAIOps",
  PAGE_ISSUE_EMBEDS = "pageIssueEmbeds",
  NESTED_PAGES = "nestedPages",
  EDITOR_ATTACHMENTS = "editorAttachments",
}

export type TFeatureFlagsResponse = {
  [featureFlag in E_FEATURE_FLAGS]: boolean;
};
