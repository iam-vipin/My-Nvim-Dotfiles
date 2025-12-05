// local imports
import { CommentsExtensionConfig } from "./extension-config";
import type { TCommentMarkOptions } from "./types";

export const CommentsExtension = (props: TCommentMarkOptions) => CommentsExtensionConfig.configure(props);
