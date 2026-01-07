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

export type JiraCustomFieldKeys =
  // Standard custom fields
  | "com.atlassian.jira.plugin.system.customfieldtypes:textfield"
  | "com.atlassian.jira.plugin.system.customfieldtypes:url"
  | "com.atlassian.jira.plugin.system.customfieldtypes:userpicker"
  | "com.atlassian.jira.plugin.system.customfieldtypes:select"
  | "com.atlassian.jira.plugin.system.customfieldtypes:float"
  | "com.atlassian.jira.plugin.system.customfieldtypes:textarea"
  | "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes"
  | "com.atlassian.jira.plugin.system.customfieldtypes:datetime"
  | "com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons"
  | "com.atlassian.jira.plugin.system.customfieldtypes:multiselect"
  | "com.atlassian.jira.plugin.system.customfieldtypes:datepicker"
  | "com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker";
