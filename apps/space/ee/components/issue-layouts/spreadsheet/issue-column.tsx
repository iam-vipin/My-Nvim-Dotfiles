import { observer } from "mobx-react";
// types
import type { IIssueDisplayProperties } from "@plane/types";
// components
import { WithDisplayPropertiesHOC } from "@/components/issues/issue-layouts/with-display-properties-HOC";
import type { IIssue } from "@/types/issue";
import { SPREADSHEET_PROPERTY_DETAILS } from "./columns";

type Props = {
  displayProperties: IIssueDisplayProperties;
  issueDetail: IIssue;
  property: keyof IIssueDisplayProperties;
};

export const IssueColumn = observer(function IssueColumn(props: Props) {
  const { displayProperties, issueDetail, property } = props;
  // router

  const propertyDetails = SPREADSHEET_PROPERTY_DETAILS[property];

  if (!propertyDetails) return <></>;

  const { Column } = propertyDetails;

  return (
    <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey={property}>
      <td
        tabIndex={0}
        className="h-11 w-full min-w-36 max-w-48 text-13 after:absolute after:w-full after:bottom-[-1px] after:border after:border-subtle border-r-[1px] border-subtle"
      >
        <Column issue={issueDetail} />
      </td>
    </WithDisplayPropertiesHOC>
  );
});
