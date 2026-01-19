import { Loader } from "@plane/ui";

export const ConversationLoader = () => {
  return (
    <div className="flex flex-col gap-2 w-full pt-6">
      <div className="w-full flex flex-col gap-2 items-end">
        <Loader>
          <Loader.Item width="100px" height="40px" />
        </Loader>
      </div>
      <Loader>
        <Loader.Item width="100px" height="40px" />
      </Loader>
    </div>
  );
};
