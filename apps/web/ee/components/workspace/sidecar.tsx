import { observer } from "mobx-react";
import { AgentSidecar } from "../agents/sidecar";
import { PiChatFloatingBot } from "../pi-chat/floating-bot";
import { useTheme } from "@/plane-web/hooks/store";

export const WorkspaceSidecar = observer(function WorkspaceSidecar() {
  const { activeSidecar, isSidecarOpen, closeSidecar, sidecarChatId, openPiChatSidecar } = useTheme();

  if (!isSidecarOpen) return null;

  return (
    <>
      {activeSidecar === "pi-chat" ? (
        <PiChatFloatingBot
          isOpen={activeSidecar === "pi-chat"}
          sidecarChatId={sidecarChatId}
          openPiChatSidecar={openPiChatSidecar}
        />
      ) : (
        <AgentSidecar isOpen={activeSidecar === "agent"} closeSidecar={closeSidecar} />
      )}
    </>
  );
});
