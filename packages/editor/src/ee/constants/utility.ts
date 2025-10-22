// ce imports
import { NODE_FILE_MAP as CORE_NODE_FILE_MAP, type NodeFileMapType } from "src/ce/constants/utility";
// local imports
import { ADDITIONAL_EXTENSIONS } from "./extensions";

export const NODE_FILE_MAP: NodeFileMapType = {
  ...CORE_NODE_FILE_MAP,
  [ADDITIONAL_EXTENSIONS.ATTACHMENT]: {
    fileSetName: "deletedAttachmentSet",
  },
};
