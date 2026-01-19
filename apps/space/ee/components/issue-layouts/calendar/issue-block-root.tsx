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

import React, { useRef } from "react";
// components
import type { IIssue } from "@/types/issue";
import { CalendarIssueBlock } from "./issue-block";
// types

type Props = {
  getIssueById: (issueId: string) => IIssue | undefined;
  issueId: string;
};

export function CalendarIssueBlockRoot(props: Props) {
  const { getIssueById, issueId } = props;

  const issueRef = useRef<HTMLAnchorElement | null>(null);

  const issue = getIssueById(issueId);

  if (!issue) return null;

  return <CalendarIssueBlock issue={issue} ref={issueRef} />;
}
