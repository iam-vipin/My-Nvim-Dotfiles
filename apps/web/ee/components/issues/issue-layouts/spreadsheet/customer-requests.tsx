import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import type { TIssue } from "@plane/types";
import { Row } from "@plane/ui";

type TProps = {
  issue: TIssue;
};

export const SpreadSheetCustomerRequestColumn = observer(function SpreadSheetCustomerRequestColumn(props: TProps) {
  const { issue } = props;
  const { t } = useTranslation();

  return (
    <Row className="flex h-11 w-full items-center border-b-[0.5px] border-subtle-1 py-1 text-11 hover:bg-layer-1 group-[.selected-issue-row]:bg-accent-primary/5 group-[.selected-issue-row]:hover:bg-accent-primary/10">
      {issue?.customer_request_ids?.length}{" "}
      {t("customers.requests.label", { count: issue?.customer_request_ids?.length }).toLowerCase()}
    </Row>
  );
});
