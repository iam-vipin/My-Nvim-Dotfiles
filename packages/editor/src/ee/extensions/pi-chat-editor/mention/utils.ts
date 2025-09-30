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
  // @ts-expect-error - Tiptap types are incorrect
  () => {
    const { searchCallback } = args;
    let component: ReactRenderer<CommandListInstance, PiChatEditorMentionsDropdownProps> | null = null;

    return {
      onStart: (props) => {
        if (!searchCallback || !props.clientRect) return;
        component = new ReactRenderer<CommandListInstance, PiChatEditorMentionsDropdownProps>(
          PiChatEditorMentionsDropdown,
          {
            props: {
              ...props,
              searchCallback,
            },
            editor: props.editor,
          }
        );
        const element = component.element as HTMLElement;
        element.style.position = "absolute";
        document.body.appendChild(element);
        updateFloatingUIFloaterPosition(props.editor, element);
      },
      onUpdate(props) {
        component?.updateProps(props);
        if (!props.clientRect) return;
        if (component?.element) {
          updateFloatingUIFloaterPosition(props.editor, component?.element as HTMLElement);
        }
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          component?.destroy();
          return true;
        }

        const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];

        if (navigationKeys.includes(props.event.key)) {
          props.event?.stopPropagation();
          return component?.ref?.onKeyDown(props);
        }
        return component?.ref?.onKeyDown(props);
      },
      onExit: () => {
        component?.element.remove();
        component?.destroy();
      },
    };
  };
