/**
 * @description returns the name of the project after checking for untitled page
 * @param {string | undefined} name
 * @returns {string}
 */
export const getPageName = (name: string | undefined) => {
  if (name === undefined) return "";
  if (!name || name.trim() === "") return "Untitled";
  return name;
};
