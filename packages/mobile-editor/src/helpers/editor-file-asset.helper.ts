import type { TFileHandler } from "@plane/editor";
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
import { callNative, checkURLValidity } from "@/helpers";

/**
 * @description this function returns the file handler required by the editor.
 * @param {TEditorFileHandlerArgs} args
 */
export const getEditorFileHandlers = (): TFileHandler => ({
  assetsUploadStatus: {},
  getAssetDownloadSrc: async (src) => src,
  getAssetSrc: async (src) => {
    if (!src) return "";
    if (checkURLValidity(src)) {
      return src;
    } else {
      return (await callNative(CallbackHandlerStrings.getResolvedImageUrl, src)) ?? src;
    }
  },
  upload: async (_, file: File) => {
    const base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const assetId = await callNative(
      CallbackHandlerStrings.uploadImage,
      JSON.stringify({
        base64Data,
        fileName: file.name,
        fileType: file.type,
      })
    );
    return assetId ?? "";
  },
  delete: async (src: string) => await callNative(CallbackHandlerStrings.deleteImage, src),
  restore: async (src: string) => await callNative(CallbackHandlerStrings.restoreImage, src),
  cancel: () => {},
  validation: {
    maxFileSize: MAX_FILE_SIZE,
  },
  checkIfAssetExists: async (assetId) => {
    const exists = await callNative(CallbackHandlerStrings.checkIfAssetExists, assetId);
    return exists;
  },
});

const MAX_FILE_SIZE = 15 * 1024 * 1024;
