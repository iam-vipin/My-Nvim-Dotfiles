import { Redis as HocuspocusRedis } from "@hocuspocus/extension-redis";
import { OutgoingMessage } from "@hocuspocus/server";
import { logger } from "@plane/logger";
// redis
import { redisManager } from "@/redis";

const getRedisClient = () => {
  const redisClient = redisManager.getClient();
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }
  return redisClient;
};

export class Redis extends HocuspocusRedis {
  constructor() {
    super({ redis: getRedisClient() });
  }

  /**
   * Broadcast a message to a document across all servers via Redis.
   * Uses empty identifier so ALL servers process the message.
   */
  public async broadcastToDocument(documentName: string, payload: unknown): Promise<number> {
    const stringPayload = typeof payload === "string" ? payload : JSON.stringify(payload);

    const message = new OutgoingMessage(documentName).writeBroadcastStateless(stringPayload);

    const emptyPrefix = Buffer.from([0]);
    const channel = this["pubKey"](documentName);
    const encodedMessage = Buffer.concat([emptyPrefix, Buffer.from(message.toUint8Array())]);

    const result = await this.pub.publish(channel, encodedMessage);

    logger.info(`REDIS_EXTENSION: Published to ${documentName}, ${result} subscribers`);

    return result;
  }
}
