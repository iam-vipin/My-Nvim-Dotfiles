import { observer } from "mobx-react";
import { cn } from "@plane/utils";
import { AiMessage } from "./ai-message";
import { MyMessage } from "./my-message";

type TProps = {
  isLoading: boolean;
  isFullScreen: boolean;
};

export const Loading = observer(function Loading(props: TProps) {
  const { isLoading } = props;

  return (
    <div className={cn("flex flex-col gap-8 max-h-full h-full overflow-y-scroll w-full pb-[230px] pt-8")}>
      {/* Loading */}
      {isLoading && <MyMessage isLoading={isLoading} />}
      {isLoading && <AiMessage isLoading={isLoading} />}
    </div>
  );
});
