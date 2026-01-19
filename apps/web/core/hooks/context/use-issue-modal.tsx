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

import { useContext } from "react";
// components
import { IssueModalContext } from "@/components/issues/issue-modal/context";
import type { TIssueModalContext } from "@/components/issues/issue-modal/context";

export const useIssueModal = (): TIssueModalContext => {
  const context = useContext(IssueModalContext);
  if (context === undefined) throw new Error("useIssueModal must be used within IssueModalProvider");
  return context;
};
