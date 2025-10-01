import type { Editor } from "@tiptap/core";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import smoothScrollIntoView from "smooth-scroll-into-view-if-needed";
import { v4 as uuidv4 } from "uuid";
// helpers
import { DROPDOWN_NAVIGATION_KEYS } from "@/helpers/tippy";
// local imports
import { MentionsDropdownSection } from "./mentions-dropdown-section";
import type { PiChatEditorMentionItem, PiChatMentionSearchCallbackResponse } from "./types";

export type PiChatEditorMentionsDropdownProps = {
  command: (item: PiChatEditorMentionItem) => void;
  query: string;
  editor: Editor;
  searchCallback: (query: string) => Promise<PiChatMentionSearchCallbackResponse>;
};

export const PiChatEditorMentionsDropdown = forwardRef((props: PiChatEditorMentionsDropdownProps, ref) => {
  const { command, query, searchCallback } = props;
  // states
  const [sections, setSections] = useState<PiChatMentionSearchCallbackResponse>({});
  const [selectedIndex, setSelectedIndex] = useState({
    section: 0,
    item: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const isEmpty = useMemo(() => Object.keys(sections).length === 0, [sections]);
  const sectionKeys = useMemo(() => Object.keys(sections), [sections]);

  const selectItem = useCallback(() => {
    try {
      const item = sections?.[selectedIndex.section]?.[selectedIndex.item];
      const transactionId = uuidv4();
      if (item) {
        command({
          ...item,
          id: transactionId,
        });
      }
    } catch (error) {
      console.error("Error selecting mention item:", error);
    }
  }, [command, sections, selectedIndex]);

  const upHandler = useCallback(() => {
    if (isEmpty) return;
    const { section, item } = selectedIndex;
    if (item === 0) {
      if (section === 0) return;
      const previousSectionKey: string | undefined = sectionKeys[section - 1];
      const prevItem = sections[previousSectionKey]?.length - 1;
      if (prevItem) {
        setSelectedIndex({
          section: section - 1,
          item: prevItem,
        });
      }
    } else {
      setSelectedIndex({
        section: section,
        item: item - 1,
      });
    }
  }, [isEmpty, sectionKeys, sections, selectedIndex]);

  const downHandler = useCallback(() => {
    if (isEmpty) return;
    const { section, item } = selectedIndex;
    const sectionKey: string | undefined = sectionKeys[section];
    const isLastItem = item === sections[sectionKey]?.length - 1;
    if (isLastItem) {
      const nextSectionKey: string | undefined = sectionKeys[section + 1];
      if (nextSectionKey) {
        setSelectedIndex({
          section: section + 1,
          item: 0,
        });
      }
    } else {
      setSelectedIndex({
        section: section,
        item: item + 1,
      });
    }
  }, [isEmpty, sectionKeys, sections, selectedIndex]);

  const tabHandler = useCallback(() => {
    const nextSectionKey: string | undefined = sectionKeys[selectedIndex.section + 1];
    if (nextSectionKey) {
      setSelectedIndex({
        section: selectedIndex.section + 1,
        item: 0,
      });
    }
  }, [sectionKeys, selectedIndex]);

  // keydown events handler
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (!DROPDOWN_NAVIGATION_KEYS.includes(event.key)) return;
      event.preventDefault();

      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        selectItem();
        return true;
      }

      if (event.key === "Tab") {
        tabHandler();
        return true;
      }

      return false;
    },
  }));

  useEffect(() => {
    const scrollIntoViewHelper = async (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) await smoothScrollIntoView(element, { behavior: "smooth", block: "center", duration: 1500 });
    };

    const selectedSectionKey = sectionKeys[selectedIndex.section];
    scrollIntoViewHelper(`${selectedSectionKey}-${selectedIndex.item}`);
  }, [sectionKeys, selectedIndex]);

  // fetch mention sections based on query
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const sectionsResponse = await searchCallback?.(query);
        if (sectionsResponse) {
          // remove empty sections
          const filteredSections = Object.fromEntries(
            Object.entries(sectionsResponse).filter(([_, value]) => value.length > 0)
          );
          setSections(filteredSections);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [query, searchCallback]);

  return (
    <div className="z-10 max-h-[90vh] w-[14rem] overflow-y-auto rounded-md border-[0.5px] border-custom-border-300 bg-custom-background-100 px-2 py-2.5 shadow-custom-shadow-rg space-y-2">
      {isLoading ? (
        <div className="text-center text-sm text-custom-text-400">Loading...</div>
      ) : (
        sectionKeys.map((type, index) => (
          <MentionsDropdownSection
            key={index}
            type={type}
            items={sections[type]}
            onClick={selectItem}
            selectedItemIndex={selectedIndex.item}
            isSectionSelected={selectedIndex.section === index}
          />
        ))
      )}
    </div>
  );
});
