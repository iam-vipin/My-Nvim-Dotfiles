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

export function MentionsDropdownSection(props: Props) {
  const { type, items, onClick, selectedItemIndex, isSectionSelected } = props;

  return (
    <Disclosure as="div" className="flex flex-col">
      <div
        className={cn(
          "shrink-0 group w-full flex items-center gap-1 whitespace-nowrap text-left text-13 font-semibold text-placeholder"
        )}
      >
        <>
          <span className="text-body-xs-regular text-tertiary capitalize my-1">
            {type === "issue" ? "Work item" : type?.replaceAll("_", " ")}
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
        <Disclosure.Panel as="div" className="text-11 space-y-0 ml-0" static>
          {items.map((item, index) => (
            <div
              key={`${type}-${index}`}
              id={`${type}-${index}`}
              onClick={() => onClick(index)}
              className={cn(
                "gap-1 rounded-sm p-1 my-1 cursor-pointer hover:bg-layer-1/50 text-body-sm-regular text-primary space-x-1 flex",
                {
                  "bg-layer-1/50": selectedItemIndex === index && isSectionSelected,
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
}
