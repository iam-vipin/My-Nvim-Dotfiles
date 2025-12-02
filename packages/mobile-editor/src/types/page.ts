import type { EPageAccess, TLogoProps } from "@plane/types";

export type TPage = {
  access: EPageAccess | undefined;
  archivedAt: string | null | undefined;
  canView: boolean;
  canEdit: boolean;
  deletedAt: string | null | undefined;
  id: string | undefined;
  isDescriptionEmpty: boolean | undefined;
  isLocked: boolean;
  name: string | undefined;
  projects?: string[] | undefined;
  workspace: string | undefined;
  logoProps: TLogoProps | undefined;
  ownedBy: string | undefined;
};
