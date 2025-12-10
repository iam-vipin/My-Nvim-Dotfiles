import type { FC } from "react";
import { Fragment } from "react";
import { observer } from "mobx-react";
// plane web components
import { OAuth, PersonalAccessTokenAuth } from "@/plane-web/components/importers/jira";
// plane web hooks
import { useJiraImporter } from "@/plane-web/hooks/store";

export const AuthenticationRoot = observer(function AuthenticationRoot() {
  // hooks
  const {
    auth: { currentAuth },
  } = useJiraImporter();

  if (currentAuth?.isAuthenticated) return null;

  return <Fragment>{currentAuth?.isOAuthEnabled ? <OAuth /> : <PersonalAccessTokenAuth />}</Fragment>;
});
