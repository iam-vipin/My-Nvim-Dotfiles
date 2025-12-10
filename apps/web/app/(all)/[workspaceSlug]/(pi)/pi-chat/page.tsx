import { useEffect } from "react";
import { observer } from "mobx-react";

import { PageHead } from "@/components/core/page-title";
import { PiChatDetail } from "@/plane-web/components/pi-chat/detail";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";

function NewChatPage() {
  // store hooks
  const { initPiChat } = usePiChat();

  useEffect(() => {
    initPiChat();
  }, []);
  return (
    <>
      <PageHead title="Plane AI" />
      <PiChatDetail isFullScreen />
    </>
  );
}

export default observer(NewChatPage);
