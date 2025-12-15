import { observer } from "mobx-react";
// components
import type { EPageStoreType } from "@/plane-web/hooks/store";
// store
import type { TPageInstance } from "@/store/pages/base-page";
import { DeleteMultiplePagesModal } from "./delete-multiple-pages-modal";

export type TPageModalsProps = {
  page: TPageInstance;
  storeType: EPageStoreType;
};

export const PageModals = observer(function PageModals(props: TPageModalsProps) {
  const { page, storeType } = props;

  return (
    <>
      <DeleteMultiplePagesModal
        editorRef={page.editor.editorRef}
        isOpen={page.deletePageModal.visible}
        onClose={page.closeDeletePageModal}
        pages={page.deletePageModal.pages}
        storeType={storeType}
      />
    </>
  );
});
