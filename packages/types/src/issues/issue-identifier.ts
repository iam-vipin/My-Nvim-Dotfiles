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

import type { IIssueDisplayProperties } from "../view-props";

export type TIssueIdentifierSize = "xs" | "sm" | "md" | "lg";

export type TIdentifierTextVariant = "default" | "secondary" | "tertiary" | "primary" | "primary-subtle" | "success";

export type TIssueIdentifierBaseProps = {
  projectId: string;
  size?: TIssueIdentifierSize;
  variant?: TIdentifierTextVariant;
  displayProperties?: IIssueDisplayProperties | undefined;
  enableClickToCopyIdentifier?: boolean;
};

export type TIssueIdentifierFromStore = TIssueIdentifierBaseProps & {
  issueId: string;
};

export type TIssueIdentifierWithDetails = TIssueIdentifierBaseProps & {
  issueTypeId?: string | null;
  projectIdentifier: string;
  issueSequenceId: string | number;
};

export type TIssueIdentifierProps = TIssueIdentifierFromStore | TIssueIdentifierWithDetails;

export type TIssueTypeIdentifier = {
  issueTypeId: string;
  size?: TIssueIdentifierSize;
};

export type TIdentifierTextProps = {
  identifier: string;
  enableClickToCopyIdentifier?: boolean;
  size?: TIssueIdentifierSize;
  variant?: TIdentifierTextVariant;
};
