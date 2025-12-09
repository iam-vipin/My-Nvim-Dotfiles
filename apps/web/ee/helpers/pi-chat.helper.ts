export const hideFloatingBot = () => {
  const floatingBot = document.getElementById("floating-bot");
  if (floatingBot) {
    floatingBot.style.display = "none";
  }
};

export const showFloatingBot = () => {
  const floatingBot = document.getElementById("floating-bot");
  if (floatingBot) {
    floatingBot.style.display = "flex";
  }
};

export const isPiAllowed = (pathname: string, workspaceSlug: string): boolean => {
  if (pathname.includes(`/${workspaceSlug?.toString()}/pi-chat/`)) return false;
  if (pathname.includes(`/${workspaceSlug?.toString()}/settings/`)) return false;
  return true;
};
