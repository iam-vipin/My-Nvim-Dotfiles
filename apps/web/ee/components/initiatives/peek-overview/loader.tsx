import type { FC } from "react";
import { MoveRight } from "lucide-react";
import { Tooltip } from "@plane/propel/tooltip";
import { Loader } from "@plane/ui";
// hooks
import { usePlatformOS } from "@/hooks/use-platform-os";

type TInitiativePeekOverviewLoader = {
  removeRoutePeekId: () => void;
};

export function InitiativePeekOverviewLoader(props: TInitiativePeekOverviewLoader) {
  const { removeRoutePeekId } = props;
  // hooks
  const { isMobile } = usePlatformOS();

  return (
    <Loader className="w-full h-screen overflow-hidden px-4 py-3 space-y-6">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-3.5">
          <Tooltip tooltipContent="Close the peek view" isMobile={isMobile}>
            <button onClick={removeRoutePeekId}>
              <MoveRight className="h-4 w-4 text-custom-text-300 hover:text-custom-text-200" />
            </button>
          </Tooltip>
          <Loader.Item width="24px" height="24px" />
          <Loader.Item width="24px" height="24px" />
        </div>
        <div className="flex items-center gap-3.5">
          <Loader.Item width="24px" height="24px" />
          <Loader.Item width="24px" height="24px" />
        </div>
      </div>

      {/* initiative title and description */}
      <div className="space-y-3">
        <Loader.Item width="100px" height="20px" />

        <div className="space-y-1">
          <Loader.Item width="300px" height="15px" />
          <Loader.Item width="400px" height="15px" />
          <div className="flex items-center gap-2">
            <Loader.Item width="20px" height="15px" />
            <Loader.Item width="500px" height="15px" />
          </div>
          <div className="flex items-center gap-2">
            <Loader.Item width="20px" height="15px" />
            <Loader.Item width="200px" height="15px" />
          </div>
          <Loader.Item width="300px" height="15px" />
          <Loader.Item width="200px" height="15px" />
        </div>

        <Loader.Item width="30px" height="30px" />
      </div>

      {/* scope breakdown */}
      <div className="flex justify-between items-center gap-2">
        <Loader.Item width="120px" height="20px" />
        <Loader.Item width="100px" height="20px" />
      </div>

      {/* progress section */}
      <div className="space-y-3">
        <Loader.Item width="80px" height="20px" />
        <div className="space-y-2">
          <Loader.Item width="100%" height="40px" />
          <Loader.Item width="100%" height="40px" />
        </div>
      </div>

      {/* properties */}
      <div className="space-y-3">
        <Loader.Item width="80px" height="20px" />
        <div className="space-y-2">
          <div className="flex items-center gap-8">
            <Loader.Item width="150px" height="25px" />
            <Loader.Item width="150px" height="25px" />
          </div>
          <div className="flex items-center gap-8">
            <Loader.Item width="150px" height="25px" />
            <Loader.Item width="150px" height="25px" />
          </div>
          <div className="flex items-center gap-8">
            <Loader.Item width="150px" height="25px" />
            <Loader.Item width="150px" height="25px" />
          </div>
        </div>
      </div>
    </Loader>
  );
}
