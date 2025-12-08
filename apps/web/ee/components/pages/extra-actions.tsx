import React from "react";
import { observer } from "mobx-react";
// plane imports
import type { TPageHeaderExtraActionsProps } from "@/ce/components/pages/extra-actions";
import { PagePublishActions } from "./publish-actions";

export const PageDetailsHeaderExtraActions = observer(function PageDetailsHeaderExtraActions(
  props: TPageHeaderExtraActionsProps
) {
  const { page, storeType } = props;

  if (!page.canCurrentUserEditPage) return null;
  return <PagePublishActions page={page} storeType={storeType} />;
});
