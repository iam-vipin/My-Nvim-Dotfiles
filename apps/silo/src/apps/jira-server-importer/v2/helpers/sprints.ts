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

/**
 * Auto-detect sprint custom field from issue fields
 * Looks for the characteristic sprint string pattern
 */
export function detectSprintFieldId(issue: any): string | null {
  for (const [fieldKey, fieldValue] of Object.entries(issue.fields)) {
    if (!fieldKey.startsWith("customfield_")) continue;

    // Check if value looks like sprint data
    if (isSprintField(fieldValue)) {
      return fieldKey;
    }
  }
  return null;
}

/**
 * Check if a field value contains sprint data
 */
export function isSprintField(value: any): boolean {
  if (!value) return false;

  // Single sprint string
  if (typeof value === "string" && value.includes("com.atlassian.greenhopper.service.sprint.Sprint@")) {
    return true;
  }

  // Array of sprint strings
  if (Array.isArray(value) && value.length > 0) {
    return typeof value[0] === "string" && value[0].includes("com.atlassian.greenhopper.service.sprint.Sprint@");
  }

  return false;
}

/**
 * Parse Jira Server sprint string format
 * Input: "com.atlassian.greenhopper.service.sprint.Sprint@19deefa2[id=2,name=Sample Sprint 1,...]"
 */
export function parseJiraServerSprint(sprintString: string): {
  id: number;
  name: string;
  state: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  activatedDate?: string;
  goal?: string;
  rapidViewId?: number;
} | null {
  if (!sprintString || typeof sprintString !== "string") return null;

  // Extract content between square brackets
  const match = sprintString.match(/\[(.+)\]$/);
  if (!match) return null;

  const content = match[1];
  const fields: Record<string, any> = {};

  // Parse key=value pairs
  const pairs = content.split(",");
  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split("=");
    const value = valueParts.join("=").trim();

    if (value === "<null>" || value === "null") {
      fields[key.trim()] = null;
    } else if (!isNaN(Number(value))) {
      fields[key.trim()] = Number(value);
    } else if (value === "true" || value === "false") {
      fields[key.trim()] = value === "true";
    } else {
      fields[key.trim()] = value;
    }
  }

  return {
    id: fields.id,
    name: fields.name,
    state: fields.state, // CLOSED, ACTIVE, FUTURE
    startDate: fields.startDate,
    endDate: fields.endDate,
    completeDate: fields.completeDate,
    activatedDate: fields.activatedDate,
    goal: fields.goal,
    rapidViewId: fields.rapidViewId,
  };
}
