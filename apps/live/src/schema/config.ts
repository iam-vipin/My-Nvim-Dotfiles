import { Schema } from "effect";
import { UrlString } from "./common";

export const NodeEnv = Schema.Literal("development", "production", "test");
export type NodeEnv = typeof NodeEnv.Type;

export const Port = Schema.NumberFromString.pipe(Schema.int(), Schema.between(1, 65535));

export const CompressionLevel = Schema.NumberFromString.pipe(Schema.int(), Schema.between(0, 9));

export const SampleRate = Schema.NumberFromString.pipe(Schema.between(0, 1));

export class AppConfig extends Schema.Class<AppConfig>("AppConfig")({
  APP_VERSION: Schema.optionalWith(Schema.NonEmptyTrimmedString, { default: () => "1.0.0" }),
  NODE_ENV: Schema.optionalWith(Schema.String, { default: () => "production" }),
  HOSTNAME: Schema.optional(Schema.String),
  PORT: Schema.optionalWith(Port, { default: () => 3000 }),
  API_BASE_URL: UrlString,
  CORS_ALLOWED_ORIGINS: Schema.optionalWith(Schema.String, { default: () => "" }),
  LIVE_BASE_PATH: Schema.optionalWith(Schema.String, { default: () => "/live" }),
  COMPRESSION_LEVEL: Schema.optionalWith(CompressionLevel, { default: () => 6 }),
  COMPRESSION_THRESHOLD: Schema.optionalWith(Schema.NumberFromString, { default: () => 5000 }),
  LIVE_SERVER_SECRET_KEY: Schema.NonEmptyTrimmedString,
  REDIS_HOST: Schema.optional(Schema.String),
  REDIS_PORT: Schema.optionalWith(Port, { default: () => 6379 }),
  REDIS_URL: Schema.optional(UrlString),
  IFRAMELY_URL: Schema.optional(UrlString),
  AMQP_URL: UrlString,
  EVENT_STREAM_EXCHANGE: Schema.optionalWith(Schema.NonEmptyTrimmedString, {
    default: () => "plane.event_stream",
  }),
  PREFETCH_COUNT: Schema.optionalWith(Schema.NumberFromString.pipe(Schema.int(), Schema.positive()), {
    default: () => 10,
  }),
  SENTRY_DSN: Schema.optional(UrlString),
  SENTRY_TRACES_SAMPLE_RATE: Schema.optional(SampleRate),
  SENTRY_ENVIRONMENT: Schema.optional(Schema.String),
}) {}

export const AppConfigFromRecord = Schema.Struct({
  ...AppConfig.fields,
});

export const getRedisUrl = (config: AppConfig): string | undefined => {
  if (config.REDIS_URL) {
    return config.REDIS_URL;
  }

  if (config.REDIS_HOST && config.REDIS_PORT && !Number.isNaN(config.REDIS_PORT)) {
    return `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`;
  }

  return undefined;
};

export const getCorsOrigins = (config: AppConfig): string[] => {
  if (!config.CORS_ALLOWED_ORIGINS) return [];
  return config.CORS_ALLOWED_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

export const isDevelopment = (config: AppConfig): boolean => config.NODE_ENV === "development";

export const isProduction = (config: AppConfig): boolean => config.NODE_ENV === "production";
