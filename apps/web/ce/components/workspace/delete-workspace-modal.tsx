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

import React from "react";
import { observer } from "mobx-react";
import type { IWorkspace } from "@plane/types";
// ui
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
// constants
// hooks

import { DeleteWorkspaceForm } from "@/components/workspace/delete-workspace-form";

type Props = {
  isOpen: boolean;
  data: IWorkspace | null;
  onClose: () => void;
};

export const DeleteWorkspaceModal = observer(function DeleteWorkspaceModal(props: Props) {
  const { isOpen, data, onClose } = props;

  return (
    <ModalCore isOpen={isOpen} handleClose={() => onClose()} position={EModalPosition.CENTER} width={EModalWidth.XL}>
      <DeleteWorkspaceForm data={data} onClose={onClose} />
    </ModalCore>
  );
});
