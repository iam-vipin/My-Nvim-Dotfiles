/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 */

import type { PDFExportMetadata, TipTapDocument } from "@/lib/pdf";
import type {
  TEditorWorkItemEmbed,
  TEditorWorkItemMention,
  TPageEmbed,
  TUserMention,
} from "@/services/page/core.service";

export type PdfExportInput = {
  readonly pageId: string;
  readonly workspaceSlug: string;
  readonly projectId?: string;
  readonly teamspaceId?: string;
  readonly title?: string;
  readonly author?: string;
  readonly subject?: string;
  readonly pageSize?: "A4" | "A3" | "A2" | "LETTER" | "LEGAL" | "TABLOID";
  readonly pageOrientation?: "portrait" | "landscape";
  readonly fileName?: string;
  readonly noAssets?: boolean;
  readonly cookie: string;
  readonly requestId: string;
};

export type PdfExportResult = {
  readonly pdfBuffer: Buffer;
  readonly outputFileName: string;
  readonly pageId: string;
};

export type PageContent = {
  readonly contentJSON: TipTapDocument;
  readonly titleHTML: string | null;
  readonly descriptionBinary: Buffer;
};

export type MetadataResult = {
  readonly workItemEmbeds: TEditorWorkItemEmbed[];
  readonly workItemMentions: TEditorWorkItemMention[];
  readonly userMentions: TUserMention[];
  readonly pageEmbeds: TPageEmbed[];
  readonly resolvedImageUrls?: Record<string, string>;
  readonly baseUrl?: string;
  readonly workspaceSlug?: string;
};
