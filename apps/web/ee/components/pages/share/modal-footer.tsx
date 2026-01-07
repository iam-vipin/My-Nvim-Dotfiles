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

import { Button } from "@plane/propel/button";

type TModalFooterProps = {
  hasUnsavedChanges: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSave: () => void;
  canCurrentUserChangeAccess?: boolean;
};

export function ModalFooter({
  hasUnsavedChanges,
  isSubmitting,
  onCancel,
  onSave,
  canCurrentUserChangeAccess = true,
}: TModalFooterProps) {
  return (
    <div className="mt-3">
      <div className="px-4 py-3 flex items-center justify-between border-t border-subtle">
        <div className="shrink-0 text-13 text-tertiary" role="status" aria-label="Change status">
          {hasUnsavedChanges && canCurrentUserChangeAccess && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse" />
              <span className="text-11 text-accent-primary font-medium">Unsaved changes</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="lg" onClick={onCancel} disabled={isSubmitting}>
            {canCurrentUserChangeAccess ? "Cancel" : "Close"}
          </Button>
          {canCurrentUserChangeAccess && (
            <Button variant="primary" size="lg" onClick={onSave} loading={isSubmitting} disabled={!hasUnsavedChanges}>
              {isSubmitting ? "Saving..." : "Share"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

ModalFooter.displayName = "ModalFooter";
