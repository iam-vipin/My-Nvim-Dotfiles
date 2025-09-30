import type { RawCommands } from "@tiptap/core";
import type { NodeType } from "@tiptap/pm/model";
import { v4 as uuidv4 } from "uuid";
import { EDrawioAttributeNames, TDrawioBlockAttributes } from "./types";
import { DEFAULT_DRAWIO_ATTRIBUTES } from "./utils/attribute";

export const drawioCommands = (nodeType: NodeType): Partial<RawCommands> => ({
  insertDrawioDiagram:
    (props) =>
    ({ commands }) => {
      const uniqueID = uuidv4();

      const attributes: TDrawioBlockAttributes = {
        ...DEFAULT_DRAWIO_ATTRIBUTES,
        [EDrawioAttributeNames.ID]: uniqueID,
        [EDrawioAttributeNames.MODE]: props.mode,
      };

      if (props.pos) {
        commands.insertContentAt(props.pos, {
          type: nodeType.name,
          attrs: attributes,
        });
      } else {
        commands.insertContent({
          type: nodeType.name,
          attrs: attributes,
        });
      }

      return true;
    },
});
