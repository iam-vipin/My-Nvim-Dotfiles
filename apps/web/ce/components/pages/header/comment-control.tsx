// store
import type { EPageStoreType } from "@/plane-web/hooks/store";
import type { TPageInstance } from "@/store/pages/base-page";

export type TPageCommentControlProps = {
  page: TPageInstance;
  storeType: EPageStoreType;
};

export function PageCommentControl({}: TPageCommentControlProps) {
  return null;
}
