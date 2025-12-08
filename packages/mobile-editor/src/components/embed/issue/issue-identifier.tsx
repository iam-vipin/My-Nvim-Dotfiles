import React, { useEffect, useState } from "react";
// ui
import { Loader } from "@plane/ui";
// constants
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { callNative } from "@/helpers/flutter-callback.helper";

type Props = {
  issueIdentifier: string;
  projectId?: string;
  workspaceSlug?: string;
};

export function IssueIdentifier(props: Props) {
  const { projectId, workspaceSlug, issueIdentifier } = props;
  const [projectIdentifier, setProjectIdentifier] = useState<string | undefined>(undefined);

  // Get the project identifier from the native code.
  useEffect(() => {
    if (!projectIdentifier) {
      callNative(
        CallbackHandlerStrings.getProjectIdentifier,
        JSON.stringify({
          projectId,
          workspaceSlug,
        })
      ).then((identifier: string) => setProjectIdentifier(identifier));
    }
  }, [projectId, projectIdentifier, workspaceSlug]);

  if (!projectIdentifier)
    return (
      <Loader className="flex flex-shrink-0 w-20 h-5">
        <Loader.Item height="100%" width="100%" />
      </Loader>
    );

  return (
    <span className={"text-sm font-medium text-custom-text-300"}>{`${projectIdentifier}-${issueIdentifier}`}</span>
  );
}
