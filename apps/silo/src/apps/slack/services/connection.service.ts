import { E_INTEGRATION_KEYS } from "@plane/constants";
import { logger } from "@plane/logger";
import { getConnectionDetails } from "@/helpers/connection-details";
import { integrationConnectionHelper } from "@/helpers/integration-connection-helper";
import { E_INTEGRATION_DISCONNECT_SOURCE, planeOAuthService } from "@/services/oauth";

class SlackConnectionService {
  public async disconnectAppWithTeamId(teamId: string) {
    logger.info("[SLACK] Disconnecting app with team ID", {
      teamId,
    });
    const details = await getConnectionDetails(E_INTEGRATION_KEYS.SLACK, teamId);
    if (!details) {
      throw new Error(`No connection details found for team ${teamId}`);
    }

    const { workspaceConnection, credential } = details;
    await integrationConnectionHelper.deleteWorkspaceConnection({
      connection_id: workspaceConnection.id,
      disconnect_meta: {
        disconnect_source: E_INTEGRATION_DISCONNECT_SOURCE.EXTERNAL,
        disconnect_id: credential.id,
      },
    });
    if (credential) {
      await planeOAuthService.deleteTokenFromCache(credential);
    }
  }
}

const slackConnectionService = new SlackConnectionService();

export default slackConnectionService;
