import { Effect, Layer, Logger, LogLevel } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { AppConfigLive } from "./services";
import { RelayServer, RelayServerLive } from "./server";

const MainLive = Layer.mergeAll(AppConfigLive, RelayServerLive);

const program = Effect.gen(function* () {
  const server = yield* RelayServer;
  yield* server.start;
  yield* Effect.never;
});

const runnable = program.pipe(Effect.provide(MainLive), Effect.scoped, Logger.withMinimumLogLevel(LogLevel.Info));

NodeRuntime.runMain(runnable);
