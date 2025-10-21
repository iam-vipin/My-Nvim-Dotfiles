import { type Editor, useEditorState } from "@tiptap/react";
import { Code, Link, Bookmark } from "lucide-react";
import { useCallback } from "react";
// constants
import type { MenuItem } from "@/components/menus";
import { CORE_EXTENSIONS } from "@/constants/extension";
// plane imports
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// types
import { IEditorProps, EExternalEmbedAttributeNames } from "@/types";

type useBlockMenuProps = {
  editor: Editor;
  flaggedExtensions?: IEditorProps["flaggedExtensions"];
  disabledExtensions?: IEditorProps["disabledExtensions"];
  onMenuClose: () => void;
};

/**
 * Hook that provides contextual block menu functionality for the editor with additional menu items for the editor
 * @param {useBlockMenuProps} props - The hook parameters
 * @param {Editor} props.editor - The TipTap editor instance
 * @param {string[]} [props.flaggedExtensions] - Extensions that are flagged
 * @param {string[]} [props.disabledExtensions] - Extensions that are disabled
 * @param {() => void} props.onMenuClose - Callback when menu is closed
 * @returns {Object} Object containing editor state and menu items
 */
export const useBlockMenu = ({ editor, flaggedExtensions, disabledExtensions, onMenuClose }: useBlockMenuProps) => {
  const isEmbedFlagged =
    flaggedExtensions?.includes("external-embed") || disabledExtensions?.includes("external-embed");

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      const selection = editor.state.selection;
      const content = selection.content().content;
      const firstChild = content.firstChild;
      let linkUrl: string | null = null;
      const foundLinkMarks: string[] = [];

      const isEmbedActive = editor.isActive(ADDITIONAL_EXTENSIONS.EXTERNAL_EMBED);
      const isRichCard = firstChild?.attrs[EExternalEmbedAttributeNames.IS_RICH_CARD];
      const isNotEmbeddable = firstChild?.attrs[EExternalEmbedAttributeNames.HAS_EMBED_FAILED];

      if (firstChild) {
        for (let i = 0; i < firstChild.childCount; i++) {
          const node = firstChild.child(i);
          const linkMarks = node.marks?.filter(
            (mark) => mark.type.name === CORE_EXTENSIONS.CUSTOM_LINK && mark.attrs?.href
          );

          linkMarks.forEach((mark) => {
            foundLinkMarks.push(mark.attrs.href);
          });
        }
        if (firstChild.attrs.src && isEmbedActive) {
          foundLinkMarks.push(firstChild.attrs.src);
        }
      }

      if (foundLinkMarks.length === 1) {
        linkUrl = foundLinkMarks[0];
      }

      return {
        isEmbedActive,
        isLinkEmbeddable: isEmbedActive || !!linkUrl,
        linkUrl,
        isRichCard,
        isNotEmbeddable,
      };
    },
  });

  const handleConvertToLink = useCallback(() => {
    const { state } = editor;
    const { selection } = state;
    const node = selection.content().content.firstChild;
    if (node?.type.name === ADDITIONAL_EXTENSIONS.EXTERNAL_EMBED) {
      const LinkValue = node.attrs.src;
      editor
        .chain()
        .insertContentAt(selection, {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: LinkValue,
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
          ],
          text: LinkValue,
        })
        .run();
    }
    onMenuClose();
  }, [editor, onMenuClose]);

  const handleConvertToEmbed = useCallback(() => {
    const { state } = editor;
    const { selection } = state;
    const LinkValue = editorState.linkUrl;
    if (LinkValue) {
      editor
        .chain()
        .insertExternalEmbed({
          [EExternalEmbedAttributeNames.IS_RICH_CARD]: false,
          [EExternalEmbedAttributeNames.SOURCE]: LinkValue,
          pos: selection,
        })
        .run();
    }
    onMenuClose();
  }, [editor, editorState.linkUrl, onMenuClose]);

  const handleConvertToRichCard = useCallback(() => {
    const { state } = editor;
    const { selection } = state;
    const LinkValue = editorState.linkUrl;
    if (LinkValue) {
      editor
        .chain()
        .insertExternalEmbed({
          [EExternalEmbedAttributeNames.IS_RICH_CARD]: true,
          [EExternalEmbedAttributeNames.SOURCE]: LinkValue,
          pos: selection,
        })
        .run();
    }
    onMenuClose();
  }, [editor, editorState.linkUrl, onMenuClose]);

  const menuItems: MenuItem[] = [
    {
      icon: Link,
      key: "link",
      label: "Convert to Link",
      // label: "externalEmbedComponent.block_menu.convert_to_link"
      isDisabled: !editorState.isEmbedActive || !editorState.linkUrl || isEmbedFlagged,
      onClick: handleConvertToLink,
    },
    {
      icon: Code,
      key: "embed",
      label: "Convert to Embed",
      // label:"externalEmbedComponent.block_menu.convert_to_embed"
      isDisabled:
        editorState.isNotEmbeddable ||
        !editorState.isLinkEmbeddable ||
        (editorState.isEmbedActive && !editorState.isRichCard) ||
        isEmbedFlagged,
      onClick: handleConvertToEmbed,
    },
    {
      icon: Bookmark,
      key: "richcard",
      label: "Convert to Rich Card",
      // label :"externalEmbedComponent.block_menu.convert_to_richcard"
      isDisabled: !editorState.isLinkEmbeddable || !editorState.linkUrl || editorState.isRichCard || isEmbedFlagged,
      onClick: handleConvertToRichCard,
    },
  ];

  return {
    editorState,
    menuItems,
  };
};
