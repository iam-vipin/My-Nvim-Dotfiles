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

import TurndownService from "turndown";
import type { PlaneResource } from "@plane/etl/slack";
import { PageSubType } from "@plane/etl/slack";

import { logger } from "@plane/logger";
import type { TWorkspaceConnection } from "@plane/types";
import { env } from "@/env";
import { getPlaneContentParser } from "./content-parser";
import { getPlaneToSlackUserMapFromWC } from "./user";

export enum EPlaneURLSegments {
  PROJECTS = "projects",
  ISSUES = "issues",
  PAGES = "pages",
  WIKI = "wiki",
  BROWSE = "browse",
}

export function extractPlaneResource(url: string): PlaneResource | null {
  try {
    const urlObj = new URL(url);

    // Split the pathname into segments
    const segments = urlObj.pathname.split("/").filter(Boolean);

    // Basic validation
    if (segments.length < 2) return null;

    // Check if it's an issue URL (must contain /browse/)
    if (segments.includes("browse")) {
      // Format: /plane/browse/WEB-3417/
      const [workspaceSlug, browse, issueKey] = segments;

      if (browse !== "browse" || !issueKey) return null;

      // Extract project identifier from issue key (e.g., "WEB" from "WEB-3417")
      const [projectIdentifier, issueIdentifer] = issueKey.split("-");

      if (!projectIdentifier) return null;

      return {
        workspaceSlug,
        projectIdentifier,
        type: "issue",
        issueKey: issueIdentifer,
      };
    } else if (segments.includes(EPlaneURLSegments.PAGES) || segments.includes(EPlaneURLSegments.WIKI)) {
      // Format can be one of these: https://sites.plane.so/pages/<pageId>/ or https://sites.plane.so/wiki/<pageId>/
      // https://app.plane.so/plane/pages/<pageId>/ or https://app.plane.so/plane/wiki/<pageId>/
      // https://app.plane.so/plane/projects/<projectId>/pages/<pageId>/ or https://app.plane.so/plane/projects/<projectId>/wiki/<pageId>/

      if (segments[0] === EPlaneURLSegments.PAGES || segments[0] === EPlaneURLSegments.WIKI) {
        // published page
        return {
          pageId: segments[1],
          type: "page",
          subType: PageSubType.PUBLISHED,
        };
      } else if (segments[1] === EPlaneURLSegments.PROJECTS) {
        // project page
        const workspaceSlug = segments[0];
        const projectId = segments[2];
        const pageId = segments[4];

        if (!workspaceSlug || !projectId || !pageId) {
          logger.error(`[SLACK] No workspace slug, project ID or page ID found for page`, { url });
          return null;
        }

        return {
          projectId,
          pageId,
          workspaceSlug,
          type: "page",
          subType: PageSubType.PROJECT,
        };
      } else if (segments[1] === EPlaneURLSegments.PAGES || segments[1] === EPlaneURLSegments.WIKI) {
        // workspace level page
        const pageId = segments[2];
        const workspaceSlug = segments[0];
        return {
          pageId,
          workspaceSlug,
          type: "page",
          subType: PageSubType.WIKI,
        };
      } else {
        logger.info(`Unknown plane URL segments in pages: ${segments}`, { url });
        return null;
      }
    } else {
      // Handle other resource types (cycles, modules)
      const [workspaceSlug, projectsSegment, projectId, _, resourceId] = segments;
      let resourceType = segments[3];

      if (projectsSegment !== "projects") return null;

      if ((resourceType === "issues" && !resourceId) || (!resourceType && !resourceId)) {
        resourceType = "project";
      }

      const baseResource = {
        workspaceSlug,
        projectId,
      };

      switch (resourceType) {
        case "project":
          return {
            type: "project",
            ...baseResource,
          };
        case "cycles":
          if (!resourceId) return null;
          return {
            ...baseResource,
            type: "cycle",
            cycleId: resourceId,
          };

        case "modules":
          if (!resourceId) return null;
          return {
            ...baseResource,
            type: "module",
            moduleId: resourceId,
          };

        default:
          return null;
      }
    }
  } catch (error) {
    logger.error(`Error extracting plane resource:`, { error, url });
    return null;
  }
}

type TSlackMarkdownFromPlaneHtmlParams = {
  workspaceConnection: TWorkspaceConnection;
  html: string;
};

export const getSlackMarkdownFromPlaneHtml = async (params: TSlackMarkdownFromPlaneHtmlParams) => {
  const { workspaceConnection, html } = params;

  const planeToSlackUserMap = getPlaneToSlackUserMapFromWC(workspaceConnection);

  const parser = getPlaneContentParser({
    appBaseUrl: env.APP_BASE_URL,
    workspaceSlug: workspaceConnection.workspace_slug,
    userMap: planeToSlackUserMap,
  });
  const parsedHtml = await parser.toPlaneHtml(html);
  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });

  turndown.addRule("link", {
    filter: (node) => node.tagName === "A",
    replacement: (content, node) => `<${(node as Element).getAttribute("href")}|${content}>`,
  });

  const markdown = turndown.turndown(parsedHtml);

  return markdown;
};
