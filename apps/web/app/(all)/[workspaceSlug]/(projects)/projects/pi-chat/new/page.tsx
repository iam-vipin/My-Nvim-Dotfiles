import { observer } from "mobx-react";
// plane imports
import { cn } from "@plane/utils";
// components
import { PageHead } from "@/components/core/page-title";
// hooks
// plane web imports
import { InputBox } from "@/plane-web/components/pi-chat/input";

function NewChatPage() {
  // store hooks

  return (
    <>
      <PageHead title="Plane AI" />
      <div className="relative flex flex-col h-[90%] flex-1 align-middle justify-center max-w-[780px] md:m-auto w-full">
        <div className={cn("flex-1 my-auto flex flex-co h-full mx-6 relative")}>
          {/* Chat Input */}
          <InputBox isProjectLevel isFullScreen />
        </div>
      </div>
    </>
  );
}

export default observer(NewChatPage);
