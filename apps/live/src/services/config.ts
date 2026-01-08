import { ConfigError, Effect, Schema } from "effect";
import { AppConfig, AppConfigFromRecord } from "../schema/config";
import dotenvx from "@dotenvx/dotenvx";

dotenvx.config();

/**
 * Configuration service that provides validated application configuration
 *
 * Uses Effect.Service pattern with effect: for synchronous initialization
 * @see https://effect.website/docs/requirements-management/services/
 */
export class ConfigService extends Effect.Service<ConfigService>()("@live/ConfigService", {
  effect: Effect.gen(function* () {
    const decode = Schema.decodeUnknown(AppConfigFromRecord);

    const result = yield* decode(process.env).pipe(
      Effect.mapError((error) => ConfigError.InvalidData([], `Invalid environment configuration: ${error.message}`))
    );

    return AppConfig.make({
      APP_VERSION: result.APP_VERSION ?? "1.0.0",
      NODE_ENV: result.NODE_ENV ?? "production",
      HOSTNAME: result.HOSTNAME,
      PORT: result.PORT ?? 3000,
      API_BASE_URL: result.API_BASE_URL,
      CORS_ALLOWED_ORIGINS: result.CORS_ALLOWED_ORIGINS ?? "",
      LIVE_BASE_PATH: result.LIVE_BASE_PATH ?? "/live",
      COMPRESSION_LEVEL: result.COMPRESSION_LEVEL ?? 6,
      COMPRESSION_THRESHOLD: result.COMPRESSION_THRESHOLD ?? 5000,
      LIVE_SERVER_SECRET_KEY: result.LIVE_SERVER_SECRET_KEY,
      REDIS_HOST: result.REDIS_HOST,
      REDIS_PORT: result.REDIS_PORT ?? 6379,
      REDIS_URL: result.REDIS_URL,
      IFRAMELY_URL: result.IFRAMELY_URL,
      AMQP_URL: result.AMQP_URL,
      EVENT_STREAM_EXCHANGE: result.EVENT_STREAM_EXCHANGE ?? "plane.event_stream",
      PREFETCH_COUNT: result.PREFETCH_COUNT ?? 10,
      SENTRY_DSN: result.SENTRY_DSN,
      SENTRY_TRACES_SAMPLE_RATE: result.SENTRY_TRACES_SAMPLE_RATE,
      SENTRY_ENVIRONMENT: result.SENTRY_ENVIRONMENT,
    });
  }),
}) {}

/**
 * Get configuration value with default fallback
 */
export const getConfigValue = <K extends keyof AppConfig>(
  key: K
): Effect.Effect<AppConfig[K], ConfigError.ConfigError, ConfigService> =>
  Effect.gen(function* () {
    const config = yield* ConfigService;
    return config[key];
  });
