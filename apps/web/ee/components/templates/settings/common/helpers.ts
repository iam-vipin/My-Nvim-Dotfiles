export const COMMON_BUTTON_CLASS_NAME = "bg-surface-1 shadow-sm rounded";
export const COMMON_ERROR_CLASS_NAME = "border border-danger";
export const COMMON_LABEL_TEXT_CLASS_NAME = "text-caption-sm-medium text-tertiary";
export const COMMON_ERROR_TEXT_CLASS_NAME = "text-caption-sm-medium text-danger-primary";

export const validateWhitespaceI18n = (value: string) => {
  if (value.trim() === "") {
    return "common.errors.required";
  }
  return undefined;
};
