import { useState } from "react";
import { Search } from "lucide-react";
import { CloseIcon } from "@plane/propel/icons";
// ui
import { Input, EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
// plane web components
import { PagesAppShortcutCommandsList } from "@/plane-web/components/command-palette";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function PagesAppShortcutsModal(props: Props) {
  const { isOpen, onClose } = props;
  // states
  const [query, setQuery] = useState("");

  const handleClose = () => {
    onClose();
    setQuery("");
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose} position={EModalPosition.TOP} width={EModalWidth.MD}>
      <div className="flex w-full flex-col space-y-4 p-5">
        <h3 className="flex justify-between">
          <span className="text-16 font-medium">Keyboard shortcuts</span>
          <button type="button" onClick={handleClose}>
            <CloseIcon className="h-4 w-4 text-secondary hover:text-primary" aria-hidden="true" />
          </button>
        </h3>
        <div className="flex w-full items-center rounded-sm border-[0.5px] border-subtle-1 bg-layer-1 px-2">
          <Search className="h-3.5 w-3.5 text-secondary" />
          <Input
            id="search"
            name="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for shortcuts"
            className="w-full border-none bg-transparent py-1 text-11 text-secondary outline-none"
            autoFocus
            tabIndex={1}
          />
        </div>
        <PagesAppShortcutCommandsList searchQuery={query} />
      </div>
    </ModalCore>
  );
}
