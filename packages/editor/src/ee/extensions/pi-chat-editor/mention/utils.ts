import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
// helpers
import { updateFloatingUIFloaterPosition } from "@/helpers/floating-ui";
import { CommandListInstance } from "@/helpers/tippy";
// local components
import { PiChatEditorMentionsDropdown, PiChatEditorMentionsDropdownProps } from "./mentions-list-dropdown";
import type { PiChatMentionSearchCallbackResponse } from "./types";

type TArgs = {
  searchCallback?: (query: string) => Promise<PiChatMentionSearchCallbackResponse>;
};

export const renderPiChatEditorMentionsDropdown =
  (args: TArgs): SuggestionOptions["render"] =>
  () => {
    const { searchCallback } = args;
    let component: ReactRenderer<CommandListInstance, PiChatEditorMentionsDropdownProps> | null = null;
    let cleanup: () => void = () => {};

    const handleClose = () => {
      component?.destroy();
      component = null;
      cleanup();
    };

    return {
      onStart: (props) => {
        if (!searchCallback || !props.clientRect) return;
        component = new ReactRenderer<CommandListInstance, PiChatEditorMentionsDropdownProps>(
          PiChatEditorMentionsDropdown,
          {
            props: {
              ...props,
              searchCallback,
              onClose: handleClose,
            } satisfies PiChatEditorMentionsDropdownProps,
            editor: props.editor,
            className: "fixed z-[100]",
          }
        );
        const element = component.element as HTMLElement;
        cleanup = updateFloatingUIFloaterPosition(props.editor, element).cleanup;
      },

      onUpdate: (props) => {
        if (!component || !component.element) return;
        component.updateProps(props);
        if (!props.clientRect) return;
        const element = component.element as HTMLElement;
        cleanup();
        cleanup = updateFloatingUIFloaterPosition(props.editor, element).cleanup;
      },

      onKeyDown({ event }) {
        if (event.key === "Escape") {
          handleClose();
          return true;
        }

        const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
        if (navigationKeys.includes(event.key)) {
          event?.stopPropagation();
        }

        return component?.ref?.onKeyDown({ event }) ?? false;
      },
      onExit: () => {
        component?.element.remove();
        handleClose();
      },
    };
  };
