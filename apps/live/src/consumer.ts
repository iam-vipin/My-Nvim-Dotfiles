import { Effect, Layer, Schema, Fiber } from "effect";
import { NodeRuntime } from "@effect/platform-node";
import { ConfigService } from "./services/config";
import type { AmqpMessage } from "./services/amqp";
import { AmqpService } from "./services/amqp";
import { MessageParseError } from "./schema/errors";

export const EventMessage = Schema.Struct({
  event_type: Schema.optional(Schema.String),
  payload: Schema.Struct({
    data: Schema.optional(Schema.Unknown),
    previous_attributes: Schema.optional(Schema.Unknown),
  }),
  timestamp: Schema.optional(Schema.Number),
  publisher: Schema.optional(Schema.String),
  publisher_instance: Schema.optional(Schema.String),
  version: Schema.optional(Schema.String),
  source: Schema.optional(Schema.String),
  outbox_id: Schema.optional(Schema.Number),
  event_id: Schema.optional(Schema.String),
  entity_type: Schema.optional(Schema.String),
  entity_id: Schema.optional(Schema.String),
  workspace_id: Schema.optional(Schema.String),
  project_id: Schema.optional(Schema.String),
  initiator_id: Schema.optional(Schema.String),
  initiator_type: Schema.optional(Schema.String),
});
export type EventMessage = typeof EventMessage.Type;

const parseEventMessage = Effect.fn("parseEventMessage")(
  (content: unknown): Effect.Effect<EventMessage, MessageParseError> =>
    Schema.decodeUnknown(EventMessage)(content).pipe(
      Effect.mapError(
        (error) =>
          new MessageParseError({
            message: `Invalid event message: ${String(error)}`,
            cause: error,
          })
      )
    )
);

const processMessage = Effect.fn("processMessage")(
  (message: AmqpMessage): Effect.Effect<void> =>
    Effect.gen(function* () {
      const parseResult = yield* parseEventMessage(message.content).pipe(Effect.either);

      if (parseResult._tag === "Left") {
        yield* Effect.logWarning("CONSUMER: Failed to parse message", { error: parseResult.left });
        yield* message.ack;
        return;
      }

      const event = parseResult.right;

      yield* Effect.logInfo("CONSUMER: Received event", event);

      if (event.event_type) {
        yield* Effect.logDebug("CONSUMER: Processing event", { event_type: event.event_type });
      }

      yield* message.ack;
    })
);

const AmqpLive = AmqpService.Default.pipe(Layer.provide(ConfigService.Default));
const ConsumerLive = Layer.merge(ConfigService.Default, AmqpLive);

const main = Effect.gen(function* () {
  const amqp = yield* AmqpService;

  yield* Effect.logInfo("CONSUMER: Starting event consumer...");
  yield* Effect.addFinalizer(() => Effect.logInfo("CONSUMER: Shutting down gracefully..."));

  const consumerFiber = yield* amqp.subscribe(processMessage);

  yield* Effect.logInfo("CONSUMER: Listening for events...");
  yield* Fiber.join(consumerFiber);
}).pipe(Effect.scoped, Effect.provide(ConsumerLive));

NodeRuntime.runMain(main);
