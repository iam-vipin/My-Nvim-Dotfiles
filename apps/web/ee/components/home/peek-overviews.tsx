import { observer } from "mobx-react";
// plane imports
import { EIssueServiceType } from "@plane/types";
import { IssuePeekOverview } from "@/components/issues/peek-overview";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// plane web imports
import { EpicPeekOverview } from "@/plane-web/components/epics/peek-overview";

export const HomePeekOverviewsRoot = observer(function HomePeekOverviewsRoot() {
  const { peekIssue } = useIssueDetail();
  const { peekIssue: epicPeekIssue } = useIssueDetail(EIssueServiceType.EPICS);

  return (
    <>
      {peekIssue && <IssuePeekOverview />}
      {epicPeekIssue && <EpicPeekOverview />}
    </>
  );
});
