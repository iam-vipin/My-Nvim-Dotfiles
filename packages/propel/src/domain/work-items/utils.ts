export const extractFileExtension = (fileName: string): string => {
  if (!fileName?.includes(".")) return "";
  return fileName.split(".").pop()?.toLowerCase() ?? "";
};
