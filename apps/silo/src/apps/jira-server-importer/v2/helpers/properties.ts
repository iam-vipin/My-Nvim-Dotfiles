import type { E_IMPORTER_KEYS } from "@plane/etl/core";
import type { ExIssueProperty } from "@plane/sdk";

export enum E_DEFAULT_PROPERTY_TYPES {
  FIX_VERSION = "fix-version",
  AFFECTED_VERSION = "affected-version",
  REPORTER = "reporter",
}

export const getDefaultPropertyExternalId = (
  resourceId: string,
  projectId: string,
  issueTypeId: string,
  propertyType: E_DEFAULT_PROPERTY_TYPES
): string => `${resourceId}-${projectId}-${issueTypeId}-${propertyType}`;

/*
 * We are using external id as the issue type id is not available in the dependency data
 * as the push function will map the external id to the internal id and that is how the
 * transform function for properties also works.
 */
export const getSupportedDefaultProperties = (
  resourceId: string,
  projectId: string,
  issueTypeId: string,
  issueTypeExternalId: string,
  source: E_IMPORTER_KEYS.JIRA_SERVER | E_IMPORTER_KEYS.JIRA
): Partial<ExIssueProperty>[] => [
  {
    type_id: issueTypeExternalId,
    external_id: getDefaultPropertyExternalId(resourceId, projectId, issueTypeId, E_DEFAULT_PROPERTY_TYPES.FIX_VERSION),
    external_source: source,
    display_name: "Fix Version",
    property_type: "TEXT",
    settings: {
      display_format: "single-line",
    },
    is_active: true,
  },
  {
    type_id: issueTypeExternalId,
    external_id: getDefaultPropertyExternalId(
      resourceId,
      projectId,
      issueTypeId,
      E_DEFAULT_PROPERTY_TYPES.AFFECTED_VERSION
    ),
    external_source: source,
    display_name: "Affected Version",
    property_type: "TEXT",
    settings: {
      display_format: "single-line",
    },
    is_active: true,
  },
  {
    type_id: issueTypeExternalId,
    external_id: getDefaultPropertyExternalId(resourceId, projectId, issueTypeId, E_DEFAULT_PROPERTY_TYPES.REPORTER),
    external_source: source,
    display_name: "Reporter",
    property_type: "RELATION",
    relation_type: "USER",
    is_active: true,
  },
];
