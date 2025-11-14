const workspaceScopes: string[] = [
  "app_mentions:read",
  "channels:read",
  "channels:join",
  "users:read",
  "users:read.email",
  "chat:write",
  "channels:history",
  "groups:history",
  "mpim:history",
  "commands",
  "links:read",
  "links:write",
  "groups:read",
  "reactions:read",
  "reactions:write",
  "files:read",
];

export const getWorkspaceAuthScopes = () => workspaceScopes.join(",");

const userScopes: string[] = ["chat:write", "im:read", "im:write", "mpim:read"];

export const getUserAuthScopes = () => userScopes.join(",");
