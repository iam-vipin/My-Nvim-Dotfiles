import { Config, Effect } from "effect";

export class AppConfig extends Effect.Service<AppConfig>()("AppConfig", {
  effect: Effect.gen(function* () {
    const port = yield* Config.number("PORT").pipe(Config.withDefault(3004));
    const nodeEnv = yield* Config.string("NODE_ENV").pipe(Config.withDefault("development"));
    const redisUrl = yield* Config.redacted("REDIS_URL");
    const channelPrefix = yield* Config.string("CHANNEL_PREFIX").pipe(Config.withDefault("relay"));

    // Relay base path for proxy deployment
    const relayBasePath = yield* Config.string("RELAY_BASE_PATH").pipe(Config.withDefault("/relay"));

    // API base URL for authentication
    const apiBaseUrl = yield* Config.string("API_BASE_URL").pipe(Config.withDefault("http://api:8000"));

    // CORS origin for socket connections (required for credentials)
    const corsOrigin = yield* Config.string("CORS_ORIGIN").pipe(Config.withDefault("http://localhost:3000"));

    // AMQP configuration
    const amqpUrl = yield* Config.string("AMQP_URL");
    const eventStreamExchange = yield* Config.string("EVENT_STREAM_EXCHANGE").pipe(
      Config.withDefault("plane.event_stream")
    );
    const prefetchCount = yield* Config.number("PREFETCH_COUNT").pipe(Config.withDefault(10));

    return {
      port,
      nodeEnv,
      redisUrl,
      channelPrefix,
      relayBasePath,
      apiBaseUrl,
      corsOrigin,
      isProduction: nodeEnv === "production",
      // AMQP
      amqpUrl,
      eventStreamExchange,
      prefetchCount,
    };
  }),
}) {}

export const AppConfigLive = AppConfig.Default;
