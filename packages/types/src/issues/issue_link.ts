export type TIssueLinkEditableFields = {
  title: string;
  url: string;
};

export type TLinkMetadata = {
  title?: string;
  favicon?: string;
  favicon_url?: string;
  url?: string;
};

export type TIssueLink = TIssueLinkEditableFields & {
  created_by_id: string;
  id: string;
  metadata: TLinkMetadata;
  issue_id: string;

  //need
  created_at: Date;
};

export type TIssueLinkMap = {
  [issue_id: string]: TIssueLink;
};

export type TIssueLinkIdMap = {
  [issue_id: string]: string[];
};
