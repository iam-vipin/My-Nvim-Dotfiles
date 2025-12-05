import type { ExtensionFileSetStorageKey as CoreExtensionFileSetStorageKey } from "@/ce/types/storage";
// local imports
import type { AttachmentExtensionStorage } from "../extensions/attachments/types";

export type ExtensionFileSetStorageKey =
  | CoreExtensionFileSetStorageKey
  | Extract<keyof AttachmentExtensionStorage, "deletedAttachmentSet">;
