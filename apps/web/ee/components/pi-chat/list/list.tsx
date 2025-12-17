import { uniqBy } from "lodash-es";
import { observer } from "mobx-react";
import type { TUserThreads } from "@/plane-web/types";
import { PiChatListItem } from "./list-item";
import PiChatListLoader from "./loader";

type TProps = {
  userThreads: TUserThreads[] | undefined;
  isLoading: boolean;
};
const PiChatList = observer(function PiChatList(props: TProps) {
  const { userThreads, isLoading } = props;

  return (
    <div className="flex flex-col space-y-2  overflow-scroll">
      <div className="flex flex-col divide-y divide-subtle-1">
        {userThreads && userThreads.length > 0 ? (
          uniqBy(userThreads, "chat_id").map((thread) => <PiChatListItem key={thread.chat_id} thread={thread} />)
        ) : isLoading ? (
          <PiChatListLoader />
        ) : (
          <div className="text-placeholder text-13">No threads available</div>
        )}
      </div>
    </div>
  );
});
export default PiChatList;
