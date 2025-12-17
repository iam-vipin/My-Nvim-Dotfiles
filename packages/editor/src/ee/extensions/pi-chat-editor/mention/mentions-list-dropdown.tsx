import { FloatingOverlay } from "@floating-ui/react";
import type { SuggestionProps } from "@tiptap/suggestion";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import smoothScrollIntoView from "smooth-scroll-into-view-if-needed";
import { v4 as uuidv4 } from "uuid";
// plane imports
import { useOutsideClickDetector } from "@plane/hooks";
// helpers
import { DROPDOWN_NAVIGATION_KEYS } from "@/helpers/tippy";
// local imports
import { MentionsDropdownSection } from "./mentions-dropdown-section";
import { EPiChatEditorAttributeNames } from "./types";
import type { PiChatEditorMentionAttributes, PiChatMentionSearchCallbackResponse } from "./types";

export type PiChatEditorMentionsDropdownProps = SuggestionProps<
  PiChatMentionSearchCallbackResponse,
  Partial<PiChatEditorMentionAttributes>
> & {
  searchCallback: (query: string) => Promise<PiChatMentionSearchCallbackResponse>;
  onClose: () => void;
};

export const PiChatEditorMentionsDropdown = forwardRef(function PiChatEditorMentionsDropdown(
  props: PiChatEditorMentionsDropdownProps,
  ref
) {
  const { command, query, searchCallback, onClose } = props;
  // states
  const [sections, setSections] = useState<PiChatMentionSearchCallbackResponse>({});
  const [selectedIndex, setSelectedIndex] = useState({
    section: 0,
    item: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  // refs
  const dropdownContainer = useRef<HTMLDivElement>(null);
  const isEmpty = useMemo(() => Object.keys(sections).length === 0, [sections]);
  const sectionKeys = useMemo(() => Object.keys(sections), [sections]);

  const selectItem = useCallback(
    (section: number, index: number) => {
      try {
        const sectionKeyAtCurrentIndex = sectionKeys[section];
        const item = sections?.[sectionKeyAtCurrentIndex]?.[index];
        const transactionId = uuidv4();
        if (item) {
          command({
            [EPiChatEditorAttributeNames.ID]: transactionId,
            [EPiChatEditorAttributeNames.LABEL]:
              sectionKeyAtCurrentIndex === "issue" ? `${item.subTitle ?? ""}` : (item.title ?? ""),
            [EPiChatEditorAttributeNames.ENTITY_IDENTIFIER]: item.id,
            [EPiChatEditorAttributeNames.ENTITY_NAME]: item.title ?? "",
            [EPiChatEditorAttributeNames.TARGET]: `${sectionKeyAtCurrentIndex}s`,
            [EPiChatEditorAttributeNames.REDIRECT_URI]: "",
          });
        }
      } catch (error) {
        console.error("Error selecting mention item:", error);
      }
    },
    [command, sectionKeys, sections, selectedIndex]
  );

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
      const nextSection = (selectedIndex.section + 1) % sectionKeys.length;
      setSelectedIndex({
        section: nextSection,
        item: 0,
      });
    } else {
      setSelectedIndex({
        section: section,
        item: item + 1,
      });
    }
  }, [isEmpty, sectionKeys, sections, selectedIndex]);

  const tabHandler = useCallback(() => {
    const nextSectionKey: string | undefined = sectionKeys[selectedIndex.section + 1];
    setSelectedIndex({
      section: nextSectionKey !== undefined ? selectedIndex.section + 1 : 0,
      item: 0,
    });
  }, [sectionKeys, selectedIndex]);

  // keydown events handler
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (![...DROPDOWN_NAVIGATION_KEYS, "Tab"].includes(event.key)) return false;
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
        selectItem(selectedIndex.section, selectedIndex.item);
        return true;
      }

      if (event.key === "Tab") {
        tabHandler();
        return true;
      }

      return true;
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

  useOutsideClickDetector(dropdownContainer, onClose);

  return (
    <>
      {/* Backdrop */}
      <FloatingOverlay
        style={{
          zIndex: 99,
        }}
        lockScroll
      />
      <div
        ref={dropdownContainer}
        className="relative max-h-[500px] w-[14rem] overflow-y-auto rounded-md border border-subtle-1 bg-surface-1 px-2 py-2.5 shadow-custom-shadow-rg space-y-2"
        style={{
          zIndex: 100,
        }}
      >
        {!query ? (
          <div className="text-center text-body-xs-regular text-tertiary">Start typing to see suggestions</div>
        ) : isLoading ? (
          <div className="text-center text-body-xs-regular text-tertiary">Loading...</div>
        ) : sectionKeys.length > 0 ? (
          sectionKeys.map((type, index) => (
            <MentionsDropdownSection
              key={index}
              type={type}
              items={sections[type]}
              onClick={(item: number) => selectItem(index, item)}
              selectedItemIndex={selectedIndex.item}
              isSectionSelected={selectedIndex.section === index}
            />
          ))
        ) : (
          <div className="text-center text-body-xs-regular text-tertiary">{"No results"}</div>
        )}
      </div>
    </>
  );
});
