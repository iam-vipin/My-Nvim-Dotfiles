export enum EApplicationAuthorizationGrantType {
  AUTHORIZATION_CODE = "authorization-code",
  CLIENT_CREDENTIALS = "client-credentials",
}

export const AUTHORIZATION_GRANT_TYPES_MAP = {
  [EApplicationAuthorizationGrantType.AUTHORIZATION_CODE]: "User-Level Connection",
  [EApplicationAuthorizationGrantType.CLIENT_CREDENTIALS]: "Workspace-Level Connection",
};