export type TProjectLinkEditableFields = {
  title: string;
  url: string;
};

export type TProjectLinkMetadata = {
  title?: string;
  favicon?: string;
  favicon_url?: string;
  url?: string;
  error?: string;
};

export type TProjectLink = TProjectLinkEditableFields & {
  created_by_id: string;
  id: string;
  metadata: TProjectLinkMetadata;
  project_id: string;

  //need
  created_at: Date;
};

export type TProjectLinkMap = {
  [project_id: string]: TProjectLink;
};

export type TProjectLinkIdMap = {
  [project_id: string]: string[];
};
