import { env } from "@/env";

export const getAppOAuthCallbackUrl = (provider: string) =>
  `${env.SILO_API_BASE_URL}${env.SILO_BASE_PATH}/api/apps/${provider}/auth/callback`;

export const getCallbackSuccessUrl = (workspaceSlug?: string) =>
  `${env.APP_BASE_URL}/${workspaceSlug}/settings/integrations`;
