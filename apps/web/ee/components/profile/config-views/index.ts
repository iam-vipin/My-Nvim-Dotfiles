import type { TUserConnection } from "@plane/constants";
import type { TPersonalAccountConnectProps } from "../personal-account-view";
import { SlackConfigView } from "./slack";

export const CONFIG_VIEWS: Record<TUserConnection, React.FC<TPersonalAccountConnectProps> | null> = {
  SLACK: SlackConfigView,
  GITHUB: null,
  GITHUB_ENTERPRISE: null,
};
