import type { FC } from "react";
import { observer } from "mobx-react";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
// local components
import { IssueLinkCreateUpdateModal } from "./collapsible-section/links/link-items/create-update-link-modal";
import { useLinkOperations } from "./collapsible-section/links/link-items/links-helper";

type Props = {
  workspaceSlug: string;
  initiativeId: string;
};

export const InitiativeModalsRoot = observer(function InitiativeModalsRoot(props: Props) {
  const { workspaceSlug, initiativeId } = props;
  // store hooks
  const {
    initiative: {
      setLastCollapsibleAction,
      initiativeLinks: { isLinkModalOpen, setIsLinkModalOpen },
    },
  } = useInitiatives();

  // helpers
  const linkOperations = useLinkOperations(workspaceSlug.toString(), initiativeId);

  // handlers
  const handleOnClose = () => {
    setIsLinkModalOpen(false);
    setLastCollapsibleAction("links");
  };

  return (
    <>
      <IssueLinkCreateUpdateModal
        isModalOpen={isLinkModalOpen}
        handleOnClose={handleOnClose}
        linkOperations={linkOperations}
      />
    </>
  );
});
