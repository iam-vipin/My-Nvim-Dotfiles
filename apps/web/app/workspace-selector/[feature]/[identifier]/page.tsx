import { useMemo } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { PlaneLockup } from "@plane/propel/icons";
// hooks
import { useUser } from "@/hooks/store/user";
// services
import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";
// local imports
import type { Route } from "./+types/page";
import { ESupportedFeatures, WorkspaceSelector } from "./workspace-selector";

const NOT_FOUND_CLASSNAME = "flex items-center justify-center h-full text-custom-text-100 text-lg font-medium";

function isValidFeature(feature: string): feature is ESupportedFeatures {
  return Object.values(ESupportedFeatures).includes(feature as ESupportedFeatures);
}

function WorkspacePickerPage({ params }: Route.ComponentProps) {
  // router
  const { feature, identifier } = params;
  // hooks
  const { data: currentUser } = useUser();
  // derived values
  const isFeatureSupported = isValidFeature(feature);

  const content = useMemo(() => {
    if (!isFeatureSupported) {
      return <div className={NOT_FOUND_CLASSNAME}>Invalid feature</div>;
    }
    if (typeof identifier !== "string") {
      return <div className={NOT_FOUND_CLASSNAME}>Invalid identifier</div>;
    }
    return <WorkspaceSelector feature={feature} identifier={identifier} />;
  }, [feature, identifier, isFeatureSupported]);

  return (
    <AuthenticationWrapper>
      <div className="flex flex-col h-full gap-y-2 pb-20">
        <div className="flex items-center justify-between p-10 lg:px-20 xl:px-36">
          <Link href="/" className="bg-custom-background-100 px-3">
            <PlaneLockup className="h-7 w-auto text-custom-text-100" />
          </Link>
          <div className="text-sm text-custom-text-100">{currentUser?.email}</div>
        </div>
        {content}
      </div>
    </AuthenticationWrapper>
  );
}

export default observer(WorkspacePickerPage);
