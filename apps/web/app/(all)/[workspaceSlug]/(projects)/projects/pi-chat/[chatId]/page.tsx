import { observer } from "mobx-react";
// plane web imports
import { PiChatDetail } from "@/plane-web/components/pi-chat/detail";

function PiChatPage() {
  return <PiChatDetail isFullScreen isProjectLevel />;
}

export default observer(PiChatPage);
