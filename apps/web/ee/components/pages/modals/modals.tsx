/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

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
