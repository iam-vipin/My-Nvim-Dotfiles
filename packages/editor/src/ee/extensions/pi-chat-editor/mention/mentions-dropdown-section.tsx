import { Disclosure, Transition } from "@headlessui/react";
// plane imports
import { cn } from "@plane/utils";
// local imports
import type { PiChatEditorMentionItem } from "./types";

type Props = {
  type: string;
  items: PiChatEditorMentionItem[];
  selectedItemIndex: number;
  isSectionSelected: boolean;
  onClick: (item: number) => void;
};

export const MentionsDropdownSection: React.FC<Props> = (props) => {
  const { type, items, onClick, selectedItemIndex, isSectionSelected } = props;

  return (
    <Disclosure as="div" className="flex flex-col">
      <div
        className={cn(
          "shrink-0 group w-full flex items-center gap-1 whitespace-nowrap text-left text-sm font-semibold text-custom-sidebar-text-400"
        )}
      >
        <>
          <span className="text-xs font-medium capitalize text-custom-text-300 my-1">
            {type === "issue" ? "Work item" : type}
          </span>
        </>
      </div>
      <Transition
        show
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Disclosure.Panel as="div" className="text-xs space-y-0 ml-0" static>
          {items.map((item, index) => (
            <div
              key={`${type}-${index}`}
              id={`${type}-${index}`}
              onClick={() => onClick(index)}
              className={cn(
                "gap-1 rounded p-1 my-1 cursor-pointer hover:bg-custom-sidebar-background-80/50 text-xs font-medium text-custom-text-200 space-x-1 flex",
                {
                  "bg-custom-sidebar-background-80/50": selectedItemIndex === index && isSectionSelected,
                }
              )}
            >
              <span className="my-auto"> {item.icon}</span>
              <span className="truncate h-[16px]">{item.title}</span>
            </div>
          ))}
        </Disclosure.Panel>
      </Transition>
    </Disclosure>
  );
};
