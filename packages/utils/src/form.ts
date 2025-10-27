import set from "lodash-es/set";

export function getChangedFields<T extends Record<string, unknown>>(
  formData: Partial<T>,
  dirtyFields: Partial<Record<Extract<keyof T, string>, boolean | undefined>>
): Partial<T> {
  const changedFields: Partial<T> = {};

  const dirtyFieldKeys = Object.keys(dirtyFields) as Array<Extract<keyof T, string>>;
  for (const dirtyField of dirtyFieldKeys) {
    if (dirtyFields[dirtyField]) {
      set(changedFields as Record<string, unknown>, [dirtyField], formData[dirtyField]);
    }
  }

  return changedFields;
}
