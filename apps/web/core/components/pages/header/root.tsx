import { observer } from "mobx-react";
// plane imports
import type { TPageNavigationTabs } from "@plane/types";
// plane web hooks
import { EPageStoreType } from "@/plane-web/hooks/store";
// local imports
import { PageTabNavigation } from "../list/tab-navigation";
import { BasePagesListHeaderRoot } from "./base";

type Props = {
  pageType: TPageNavigationTabs;
  projectId: string;
  workspaceSlug: string;
};

export const PagesListHeaderRoot = observer(function PagesListHeaderRoot(props: Props) {
  const { pageType, projectId, workspaceSlug } = props;

  return (
    <BasePagesListHeaderRoot
      storeType={EPageStoreType.PROJECT}
      tabNavigationComponent={
        <PageTabNavigation workspaceSlug={workspaceSlug} projectId={projectId} pageType={pageType} />
      }
    />
  );
});
