import type { FC } from "react";
import { useState, Fragment } from "react";
import { Search } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { CloseIcon } from "@plane/propel/icons";
// ui
import { Input } from "@plane/ui";
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
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-backdrop transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-30 overflow-y-auto">
          <div className="my-10 flex items-center justify-center p-4 text-center sm:p-0 md:my-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative flex h-full items-center justify-center">
                <div className="flex w-full flex-col  space-y-4 overflow-hidden rounded-lg bg-surface-1 p-5 shadow-raised-200 transition-all sm:w-[28rem]">
                  <Dialog.Title as="h3" className="flex justify-between">
                    <span className="text-16 font-medium">Keyboard shortcuts</span>
                    <button type="button" onClick={handleClose}>
                      <CloseIcon className="h-4 w-4 text-secondary hover:text-primary" aria-hidden="true" />
                    </button>
                  </Dialog.Title>
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
