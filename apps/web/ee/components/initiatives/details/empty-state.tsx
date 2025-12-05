"use client";

import type { FC } from "react";
// plane imports
import { useTranslation } from "@plane/i18n";
// assets
import emptyIssue from "@/app/assets/empty-state/issue.svg?url";
// components
import { EmptyState } from "@/components/common/empty-state";
// hooks
import { useAppRouter } from "@/hooks/use-app-router";

type TInitiativeEmptyStateProps = {
  workspaceSlug: string;
};

export const InitiativeEmptyState: FC<TInitiativeEmptyStateProps> = (props) => {
  const { workspaceSlug } = props;
  // router
  const router = useAppRouter();

  const { t } = useTranslation();

  return (
    <EmptyState
      image={emptyIssue}
      title={t("initiatives.empty_state.not_found.title")}
      description={t("initiatives.empty_state.not_found.description")}
      primaryButton={{
        text: t("initiatives.empty_state.not_found.primary_button.text"),
        onClick: () => router.push(`/${workspaceSlug}/initiatives/`),
      }}
    />
  );
};
