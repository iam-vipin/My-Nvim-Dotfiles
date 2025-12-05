// extensions
import { FileCode2, Paperclip, Sigma, SquareRadical } from "lucide-react";
import { VideoIcon } from "@plane/propel/icons";
import type { TSlashCommandAdditionalOption } from "@/extensions";
// types
import { EExternalEmbedAttributeNames } from "@/plane-editor/types/external-embed";
import type { CommandProps, IEditorProps, TExtensions } from "@/types";
// plane editor
import { ProBadge } from "../components/badges/pro-badge";
import { insertAttachment, insertBlockMath, insertExternalEmbed, insertInlineMath } from "../helpers/editor-commands";
import { EMBED_SEARCH_TERMS } from "./external-embed/constants";

type Props = Pick<IEditorProps, "disabledExtensions" | "flaggedExtensions">;

const coreSlashCommandRegistry: {
  isEnabled: (disabledExtensions: TExtensions[], flaggedExtensions: TExtensions[]) => boolean;
  getOption: (props: Props) => TSlashCommandAdditionalOption;
}[] = [
  {
    isEnabled: (disabledExtensions, flaggedExtensions) =>
      !disabledExtensions.includes("attachments") && !flaggedExtensions.includes("attachments"),
    getOption: () => ({
      commandKey: "attachment",
      key: "attachment",
      title: "Attachment",
      description: "Insert a file",
      searchTerms: ["image", "photo", "picture", "pdf", "media", "upload", "audio", "video", "file", "attachment"],
      icon: <Paperclip className="size-3.5" />,
      command: ({ editor, range }) =>
        insertAttachment({ editor, event: "insert", range, acceptedFileType: "all" }),
      section: "general",
      pushAfter: "image",
    }),
  },
  {
    // Block equation slash command
    isEnabled: (disabledExtensions, flaggedExtensions) =>
      !flaggedExtensions?.includes("mathematics") && !disabledExtensions?.includes("mathematics"),
    getOption: ({ flaggedExtensions }) => ({
      commandKey: "block-equation",
      key: "block-equation",
      title: "Block equation",
      description: "Insert block equation",
      searchTerms: ["math", "equation", "latex", "formula", "block"],
      icon: <Sigma className="size-3.5" />,
      command: ({ editor, range }) => {
        insertBlockMath({ editor, range, latex: "" });
      },
      section: "general",
      pushAfter: "attachment",
      badge: flaggedExtensions?.includes("mathematics") ? <ProBadge /> : undefined,
    }),
  },
  {
    // Inline equation slash command
    isEnabled: (disabledExtensions, flaggedExtensions) =>
      !flaggedExtensions?.includes("mathematics") && !disabledExtensions?.includes("mathematics"),
    getOption: ({ flaggedExtensions }) => ({
      commandKey: "inline-equation",
      key: "inline-equation",
      title: "Inline equation",
      description: "Insert inline equation",
      searchTerms: ["math", "equation", "latex", "formula", "inline"],
      icon: <SquareRadical className="size-3.5" />,
      command: ({ editor, range }) => {
        insertInlineMath({ editor, range, latex: "" });
      },
      section: "general",
      pushAfter: "block-equation",
      badge: flaggedExtensions?.includes("mathematics") ? <ProBadge /> : undefined,
    }),
  },
  {
    // External embed slash command
    isEnabled: (disabledExtensions, flaggedExtensions) =>
      !flaggedExtensions?.includes("external-embed") && !disabledExtensions?.includes("external-embed"),
    getOption: ({ flaggedExtensions }) => ({
      commandKey: "external-embed",
      key: "embed",
      title: "Embed",
      icon: <FileCode2 className="size-3.5" />,
      description: "Insert an Embed",
      searchTerms: EMBED_SEARCH_TERMS,
      command: ({ editor, range }: CommandProps) =>
        insertExternalEmbed({ editor, range, [EExternalEmbedAttributeNames.IS_RICH_CARD]: false }),
      badge: flaggedExtensions?.includes("external-embed") ? <ProBadge /> : undefined,
      section: "general",
      pushAfter: "code",
    }),
  },
  {
    // Video attachment slash command
    isEnabled: (disabledExtensions, flaggedExtensions) =>
      !flaggedExtensions?.includes("video-attachments") && !disabledExtensions?.includes("attachments"),
    getOption: ({ flaggedExtensions }) => ({
      commandKey: "attachment",
      key: "video",
      title: "Video",
      icon: <VideoIcon className="size-3.5" />,
      description: "Insert a video",
      searchTerms: ["video", "mp4", "mov", "media", "clip"],
      command: ({ editor, range }: CommandProps) =>
        insertAttachment({
          editor,
          range,
          event: "insert",
          preview: true,
          acceptedFileType: "video",
        }),
      badge: flaggedExtensions?.includes("video-attachments") ? <ProBadge /> : undefined,
      section: "general",
      pushAfter: "attachment",
    }),
  },
];

export const coreEditorAdditionalSlashCommandOptions = (props: Props): TSlashCommandAdditionalOption[] => {
  const { disabledExtensions = [], flaggedExtensions = [] } = props;

  // Filter enabled slash command options from the registry
  const options = coreSlashCommandRegistry
    .filter((command) => command.isEnabled(disabledExtensions, flaggedExtensions))
    .map((command) => command.getOption(props));

  return options;
};
