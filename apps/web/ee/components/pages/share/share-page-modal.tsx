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
// plane imports
import type { EPageSharedUserAccess } from "@plane/types";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
// types
import type { TPageShareFormUser } from "@/plane-web/hooks/pages/use-page-share-form";
import type { TPendingSharedUser, TModifiedSharedUser } from "./types";
// components
import { ModalHeader, MemberSearch, PendingUsersSection, ExistingUsersSection, EmptyState, ModalFooter } from ".";

type TMemberOption = {
  value: string;
  query: string;
  content: React.ReactNode;
};

type TSharePageModalData = {
  pageTitle: string;
  copied: boolean;
  sharedUsers: TPageShareFormUser[];
  pendingSharedUsers: TPendingSharedUser[];
  modifiedSharedUsers: TModifiedSharedUser[];
  existingUsers: TPageShareFormUser[];
  memberOptions: TMemberOption[];
  totalSharedUsers: number;
  hasUnsavedChanges: boolean;
  isSubmitting: boolean;
  isLoadingSharedUsers: boolean;
  isSharedUsersAccordionOpen: boolean;
  canCurrentUserChangeAccess: boolean;
};

type TSharePageModalActions = {
  copyLink: () => void;
  selectMember: (memberId: string) => void;
  toggleSharedUsersAccordion: () => void;
  updateExistingAccess: (userId: string, access: EPageSharedUserAccess) => void;
  removeExisting: (userId: string) => void;
  updatePendingAccess: (userId: string, access: EPageSharedUserAccess) => void;
  removePending: (userId: string) => void;
  save: () => void;
  cancel: () => void;
  getMemberDetails: (userId: string) => any;
  isUserModified: (userId: string) => boolean;
};

type TSharePageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: TSharePageModalData;
  onAction: TSharePageModalActions;
  originPosition?: { x: number; y: number } | null;
};

export function SharePageModal({ isOpen, onClose, data, onAction }: TSharePageModalProps) {
  if (!isOpen) return null;

  return (
    <ModalCore
      isOpen={isOpen}
      handleClose={onClose}
      position={EModalPosition.CENTER}
      width={EModalWidth.LG}
      className="animate-in fade-in zoom-in-95 duration-300 ease-out"
    >
      <ModalHeader pageTitle={data.pageTitle} copied={data.copied} onCopyLink={onAction.copyLink} />

      <div className="mt-2 px-4 min-h-60 transition-all duration-300 ease-in-out">
        <MemberSearch
          memberOptions={data.memberOptions}
          onSelectMember={onAction.selectMember}
          canCurrentUserChangeAccess={data.canCurrentUserChangeAccess}
        />

        <div className="transition-all duration-300 ease-in-out">
          <PendingUsersSection
            pendingUsers={data.pendingSharedUsers}
            onUpdateAccess={onAction.updatePendingAccess}
            onRemove={onAction.removePending}
            getMemberDetails={onAction.getMemberDetails}
            canCurrentUserChangeAccess={data.canCurrentUserChangeAccess}
          />

          {data.pendingSharedUsers.length > 0 && data.existingUsers.length > 0 && (
            <div className="shrink-0 mt-3 h-[0.5px] bg-layer-1 transition-all duration-300 ease-in-out" />
          )}

          <ExistingUsersSection
            existingUsers={data.existingUsers}
            onUpdateAccess={onAction.updateExistingAccess}
            onRemove={onAction.removeExisting}
            getMemberDetails={onAction.getMemberDetails}
            isUserModified={onAction.isUserModified}
            isAccordionOpen={data.isSharedUsersAccordionOpen}
            onToggleAccordion={onAction.toggleSharedUsersAccordion}
            canCurrentUserChangeAccess={data.canCurrentUserChangeAccess}
            isLoading={data.isLoadingSharedUsers}
          />

          <EmptyState
            isLoading={data.isLoadingSharedUsers}
            totalUsers={data.totalSharedUsers}
            pendingUsersCount={data.pendingSharedUsers.length}
            existingUsersCount={data.existingUsers.length}
          />
        </div>
      </div>

      <ModalFooter
        hasUnsavedChanges={data.hasUnsavedChanges}
        isSubmitting={data.isSubmitting}
        onSave={onAction.save}
        onCancel={onAction.cancel}
        canCurrentUserChangeAccess={data.canCurrentUserChangeAccess}
      />
    </ModalCore>
  );
}

SharePageModal.displayName = "SharePageModal";
